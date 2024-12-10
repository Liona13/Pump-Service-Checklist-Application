// PDF Generation utility for Pump Service Checklist
// Last updated: March 2024
import { TDocumentDefinitions, Content, ContentColumns, ContentTable, Style, TFontDictionary, PageBreak } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake with fonts
if (typeof window !== 'undefined') {
  // @ts-ignore - pdfMake types are not properly defined
  pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs;
}

// Extend Window interface to include pdfMake
declare global {
  interface Window {
    pdfMake?: {
      vfs: { [key: string]: string };
    };
  }
}

// Define VFS interface
interface VFSModule {
  default: {
    vfs: { [file: string]: string };
  };
}

interface FormData {
  company: string;
  site_location: string;
  contact_person: string;
  department: string;
  phone: string;
  email: string;
  pump_model: string;
  serial_number: string;
  manufacture_year: string;
  operating_hours: string;
  last_service_date: string;
  installation_date: string;
  temperature: string;
  flow_rate: string;
  suction_pressure: string;
  discharge_pressure: string;
  total_head: string;
  pumped_medium: string;
  service_reason: string;
  training_hours?: string;
}

interface Checkboxes {
  system_flush: boolean;
  safety_training: boolean;
  harmless_form: boolean;
  sds: boolean;
  alignment_report: boolean;
  operation_records: boolean;
  power_isolated: boolean;
  valves_locked: boolean;
  pump_drained: boolean;
  auxiliary_disconnected: boolean;
  coupling_guard_removed: boolean;
  coupling_disconnected: boolean;
  pump_cleaned: boolean;
  openings_protected: boolean;
  photos_taken: boolean;
}

interface CanvasRect {
  type: 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
  lineWidth: number;
  lineColor: string;
}

interface CanvasLine {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineWidth: number;
  lineColor: string;
}

type CanvasElement = CanvasRect | CanvasLine;

interface Column {
  width: number | 'auto' | '*';
  text?: string;
  canvas?: CanvasElement[];
  margin?: number[];
  image?: string;
  stack?: Content[];
}

interface VFSProvider {
  pdfMake?: {
    vfs?: { [key: string]: string };
  };
  default?: {
    pdfMake?: {
      vfs?: { [key: string]: string };
    };
  };
}

export async function generatePDF(formData: FormData, checkboxes: Checkboxes, language: 'en' | 'th'): Promise<Blob | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Register fonts - using default fonts from VFS
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // Load images with size limit
    const maxImageSize = 500 * 1024; // 500KB limit

    const loadImage = async (url: string): Promise<string> => {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // If image is too large, resize it
      if (blob.size > maxImageSize) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions while maintaining aspect ratio
            const aspectRatio = width / height;
            if (width > 800) {
              width = 800;
              height = width / aspectRatio;
            }
            if (height > 800) {
              height = 800;
              width = height * aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            } else {
              resolve('');
            }
          };
          img.src = URL.createObjectURL(blob);
        });
      }
      
      // If image is small enough, use it as is
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    const [logoBase64, qrBase64] = await Promise.all([
      loadImage('/Logo.png'),
      loadImage('/QR.jpeg')
    ]);

    // Function to create checkbox item
    const createCheckboxItem = (checked: boolean, text: string): ContentColumns => {
      const box: CanvasRect = {
        type: 'rect',
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        lineWidth: 1,
        lineColor: '#374151'
      };

      const checkmark: CanvasLine[] = checked ? [
        {
          type: 'line',
          x1: 2,
          y1: 5,
          x2: 4,
          y2: 8,
          lineWidth: 1.5,
          lineColor: '#1F2937'
        },
        {
          type: 'line',
          x1: 4,
          y1: 8,
          x2: 8,
          y2: 2,
          lineWidth: 1.5,
          lineColor: '#1F2937'
        }
      ] : [];

      return {
        columns: [
          {
            width: 12,
            canvas: [box, ...checkmark]
          },
          {
            width: 'auto',
            text: text,
            margin: [5, -2, 0, 0]
          }
        ],
        margin: [0, 0, 0, 8]
      };
    };

    // Create checklist items
    const preServiceChecklist = [
      createCheckboxItem(checkboxes.system_flush, 
        language === 'en' ? 'System flushed (if hazardous/hardening materials)' : 'ล้างระบบแล้ว (กรณีสารอันตราย/สารที่แข็งตัว)'),
      createCheckboxItem(checkboxes.safety_training, 
        language === 'en' 
          ? `Safety Training required? ${formData.training_hours ? `(${formData.training_hours} hours)` : ''}`
          : `ต้องรารการฝึกอบรมความปลอดภัยหรือไม่? ${formData.training_hours ? `(${formData.training_hours} ชั่วโมง)` : ''}`),
      createCheckboxItem(checkboxes.harmless_form,
        language === 'en' ? 'Declaration of Harmlessness form (in the operation manual)' : 'แบบฟอร์มการประกาศความไม่เป็นอันตราย (ในคู่มือการใช้าน)'),
      createCheckboxItem(checkboxes.sds,
        language === 'en' ? 'Safety Data Sheet (SDS) available' : 'มีเอกสารขมูลความปลอดภัย (SDS)'),
      createCheckboxItem(checkboxes.alignment_report,
        language === 'en' ? 'Alignment report available' : 'มีรายงานการปรับแนวเพลา'),
      createCheckboxItem(checkboxes.operation_records,
        language === 'en' ? 'Operation records available' : 'มีบันทึกการทำงาน')
    ];

    // Section titles
    const sectionTitles = {
      customerDetails: {
        en: '1. Customer Details',
        th: '1. รายละเอียดลูกค้า'
      },
      pumpInfo: {
        en: '2. Pump Information',
        th: '2. ข้อมูลปั๊ม'
      },
      operatingConditions: {
        en: '3. Operating Conditions',
        th: '3. สภาวะการทำงานจริง'
      },
      pumpPreparation: {
        en: '4. Pump Preparation (By Customer or WFA)',
        th: '4. การเตรียมปั๊ม (โดยลูกค้าหรือ WFA)'
      },
      preparationChecklist: {
        en: '5. Customer Preparation Checklist',
        th: '5. รายการเตรียมความพร้มองลูกค้า'
      },
      preServiceRequirements: {
        en: 'Pre-Service Requirements',
        th: 'ข้อกำหนดก่อนเข้าซ่อม'
      },
      importantNotes: {
        en: 'Important Notes:',
        th: 'หลายเหตุสำคัญ:'
      }
    };

    // Important notes
    const importantNotes = [
      {
        en: 'All work must be performed by qualified personnel only',
        th: 'งานทั้งหมดต้องดำเนินการโดยบุคลากรที่มีคุณสมบัติเท่านั้น'
      },
      {
        en: 'Follow all safety protocols and guidelines',
        th: 'ปฏิบัติตามขั้นตอนและแนวทางด้านความปลอดภัยทั้งหมด'
      },
      {
        en: 'Maintain proper documentation throughout the service process',
        th: 'รักษาเอกสารที่เหมาะสมตลอดกระบวนการให้บริการ'
      },
      {
        en: 'Use only OEM parts or approved equivalents',
        th: 'ใช้เฉพาะชิ้นส่วน OEM หรือชิ้นส่วนที่ได้รับการอนุมัติเท่านั้น'
      },
      {
        en: 'Follow all safety protocols, especially regarding magnetic coupling hazards',
        th: 'ปฏิบัติตามโปรโตคอลความปลอดภัยทั้งหมด โดยเฉพาะอย่างยิ่งเกี่ยวกับอันตรายจากการเชื่อมต่อแม่เหล็ก'
      },
      {
        en: "Refer to manufacturer's manual for specific torque values and clearances",
        th: 'อ้างอิงคู่มือของผู้ผลิตสำหรับค่าแรงบิดและระยะห่างที่เฉพาะเจาะจง'
      },
      {
        en: 'Required for magnetic coupling handling - keep sensitive items at minimum 1m distance',
        th: 'จำเป็นสำหรับการจัดการการเชื่อมต่อแม่เหล็ก - เก็บรักษาอุปกรณ์ที่มีความอ่อนไหวในระยะห่างอย่างน้อย 1 เมตร'
      }
    ];

    // Document header
    const docHeader = {
      company: { en: 'Water Field Asia Co., Ltd.', th: 'บริษท วอเตอร์ฟิลด์ เอเชีย จำกัด' },
      address1: { en: '623 Soi Onnut 70/1 Sub 2', th: '623 ซอยอ่อนนุช 70/1 แยก 2' },
      address2: { en: 'Pravet Sub-District, Pravet District,', th: 'แขวงประเวศ เขตประเวศ' },
      address3: { en: 'Bangkok 10250', th: 'กรุงเทพมหานคร 10250' },
      phone: { en: 'Tel.: +66 2320 1994', th: 'โทร: +66 2320 1994' },
      docNo: { en: 'Document No: FM-WFA-SER-057', th: 'เลขที่เอกสาร: FM-WFA-SER-057' },
      revision: { en: 'Revision: 00', th: 'แก้ไขครั้งที่: 00' },
      date: { 
        en: `Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('.')}`,
        th: `วันที่: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('.')}`
      }
    };

    // Thai translations for form fields
    const translations = {
      company: { en: 'Company:', th: 'บริษท:' },
      siteLocation: { en: 'Site Location:', th: 'สถานที่ติดตั้ง:' },
      contactPerson: { en: 'Contact Person:', th: 'ผู้ติดต่อ:' },
      department: { en: 'Department:', th: 'แผนก:' },
      phone: { en: 'Phone:', th: 'โทรศัพท์:' },
      email: { en: 'Email:', th: 'อีเมล:' },
      pumpModel: { en: 'Pump Model:', th: 'รุ่นปั๊ม:' },
      serialNumber: { en: 'Serial Number:', th: 'หมายเลขเครื่อง:' },
      yearOfManufacture: { en: 'Year of Manufacture:', th: 'ปีท่ผลิต:' },
      operatingHours: { en: 'Operating Hours:', th: 'ชั่วโมงการทำงาน:' },
      lastServiceDate: { en: 'Last Service Date:', th: 'วันที่เข้าซ่อมครั้งล่าสุด:' },
      installationDate: { en: 'Installation Date:', th: 'วันที่ติดตั้ง:' },
      temperature: { en: 'Temperature (°C):', th: 'อุณหภูมิ (°C):' },
      flowRate: { en: 'Flow Rate (m³/h):', th: 'อัตราการไหล (m³/h):' },
      suctionPressure: { en: 'Suction Pressure (bar):', th: 'แรงดันด้านดูด (bar):' },
      dischargePressure: { en: 'Discharge Pressure (bar):', th: 'แรงดันด้านส่ง (bar):' },
      totalHead: { en: 'Total Head (m):', th: 'เฮดรมม (m):' },
      pumpedMedium: { en: 'Pumped Medium:', th: 'ของเหลวที่สูบ:' },
      serviceReason: { en: 'Description of Issues/Reason for Service:', th: 'รายละเอียดปัญหา/เหตุผลในการเข้าซ่ม:' }
    };

    // Create table layout
    const tableLayout = {
      lightHorizontalLines: {
        hLineWidth: (i: number, node: any) => {
          return i === 0 || i === node.table.body.length ? 0 : 0.5;
        },
        vLineWidth: () => 0,
        hLineColor: () => '#E5E7EB',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 8,
        paddingBottom: () => 8
      }
    };

    // Create document definition
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        lineHeight: 1.2,
        color: '#1F2937'
      },
      content: [
        // Company Header (only on first page)
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  image: logoBase64,
                  width: 120,
                  height: 60,
                  margin: [0, 0, 0, 10]
                },
                { text: docHeader.company[language], style: 'headerCompany' },
                { text: docHeader.address1[language], style: 'headerAddress' },
                { text: docHeader.address2[language], style: 'headerAddress', margin: [0, 10, 0, 0] },
                { text: docHeader.address3[language], style: 'headerAddress', margin: [0, 10, 0, 0] },
                { text: docHeader.phone[language], style: 'headerAddress', margin: [0, 10, 0, 0] }
              ]
            },
            {
              width: 'auto',
              stack: [
                {
                  stack: [
                    { text: docHeader.docNo[language], style: 'headerDoc' },
                    { text: docHeader.revision[language], style: 'headerDoc', margin: [0, 10, 0, 0] },
                    { text: docHeader.date[language], style: 'headerDoc', margin: [0, 10, 0, 0] }
                  ]
                },
                {
                  image: qrBase64,
                  width: 50,
                  height: 50,
                  alignment: 'right',
                  margin: [0, 35, 0, 0]
                }
              ],
              margin: [40, 0, 0, 0]
            }
          ],
          margin: [0, 0, 0, 20]
        },
        // Customer Details section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.customerDetails[language],
              style: 'sectionHeader'
            },
            {
              layout: 'lightHorizontalLines',
              table: {
                widths: ['30%', '70%'],
                headerRows: 0,
                body: [
                  [{ text: translations.company[language], style: 'label' }, { text: formData.company || '-' }],
                  [{ text: translations.siteLocation[language], style: 'label' }, { text: formData.site_location || '-' }],
                  [{ text: translations.contactPerson[language], style: 'label' }, { text: formData.contact_person || '-' }],
                  [{ text: translations.department[language], style: 'label' }, { text: formData.department || '-' }],
                  [{ text: translations.phone[language], style: 'label' }, { text: formData.phone || '-' }],
                  [{ text: translations.email[language], style: 'label' }, { text: formData.email || '-' }]
                ]
              }
            }
          ]
        },
        // Pump Information section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.pumpInfo[language],
              style: 'sectionHeader',
              margin: [0, 20, 0, 10]
            },
            {
              layout: 'lightHorizontalLines',
              table: {
                widths: ['30%', '70%'],
                headerRows: 0,
                body: [
                  [{ text: translations.pumpModel[language], style: 'label' }, { text: formData.pump_model || '-' }],
                  [{ text: translations.serialNumber[language], style: 'label' }, { text: formData.serial_number || '-' }],
                  [{ text: translations.yearOfManufacture[language], style: 'label' }, { text: formData.manufacture_year || '-' }],
                  [{ text: translations.operatingHours[language], style: 'label' }, { text: formData.operating_hours || '-' }],
                  [{ text: translations.lastServiceDate[language], style: 'label' }, { text: formData.last_service_date || '-' }],
                  [{ text: translations.installationDate[language], style: 'label' }, { text: formData.installation_date || '-' }]
                ]
              }
            }
          ]
        },
        // Operating Conditions section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.operatingConditions[language],
              style: 'sectionHeader',
              margin: [0, 20, 0, 10]
            },
            {
              layout: 'lightHorizontalLines',
              table: {
                widths: ['30%', '70%'],
                headerRows: 0,
                body: [
                  [{ text: translations.temperature[language], style: 'label' }, { text: formData.temperature || '-' }],
                  [{ text: translations.flowRate[language], style: 'label' }, { text: formData.flow_rate || '-' }],
                  [{ text: translations.suctionPressure[language], style: 'label' }, { text: formData.suction_pressure || '-' }],
                  [{ text: translations.dischargePressure[language], style: 'label' }, { text: formData.discharge_pressure || '-' }],
                  [{ text: translations.totalHead[language], style: 'label' }, { text: formData.total_head || '-' }],
                  [{ text: translations.pumpedMedium[language], style: 'label' }, { text: formData.pumped_medium || '-' }]
                ]
              }
            },
            {
              text: translations.serviceReason[language],
              style: 'label',
              margin: [0, 10, 0, 5]
            },
            {
              text: formData.service_reason || '-',
              margin: [0, 0, 0, 20]
            }
          ]
        },
        // Pump Preparation section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.pumpPreparation[language],
              style: 'sectionHeader',
              margin: [0, 20, 0, 10]
            },
            {
              stack: [
                createCheckboxItem(checkboxes.power_isolated, 
                  language === 'en' ? 'Pump isolated from power supply (customer responsibility)' : 'ปั๊มถูกตัดแยกจากแหล่งจ่ายไฟ (ความรับผิดชอบของลูกค้า)'),
                createCheckboxItem(checkboxes.valves_locked,
                  language === 'en' ? 'Suction/discharge valves locked (customer responsibility)' : 'วาล์วดูด/จ่ายถูกล็อค (ความรับผิดชอบของลูกค้า)'),
                createCheckboxItem(checkboxes.pump_drained,
                  language === 'en' ? 'Pump drained (customer responsibility)' : 'ระบายของเหลวออกจากปั๊ม (ความรับผิดชอบของลูกค้า)'),
                createCheckboxItem(checkboxes.auxiliary_disconnected,
                  language === 'en' ? 'Auxiliary systems disconnected (e.g., external sensors)' : 'ระบบเสริมถูกตัดการเชื่อมต่อ (เช่น เซ็นเอรภายนอก)'),
                createCheckboxItem(checkboxes.coupling_guard_removed,
                  language === 'en' ? 'Coupling guard removed' : 'ฝาครอบคัปปลิ��งถูกถอดออก'),
                createCheckboxItem(checkboxes.coupling_disconnected,
                  language === 'en' ? 'Coupling disconnected' : 'คัปปลิ้งถูกถอดออก'),
                createCheckboxItem(checkboxes.pump_cleaned,
                  language === 'en' ? 'Pump cleaned externally' : 'ทำความสะอาดภายนอกปั๊ม'),
                createCheckboxItem(checkboxes.openings_protected,
                  language === 'en' ? 'All openings protected' : 'ช่องเปิดทั้งหมดได้รับการป้องกัน'),
                createCheckboxItem(checkboxes.photos_taken,
                  language === 'en' ? 'Photographs taken (if possible)' : 'ถ่ายภาพ (ถ้าเป็นไปได้)')
              ],
              margin: [0, 10, 0, 20]
            }
          ]
        },
        // Customer Preparation Checklist section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.preparationChecklist[language],
              style: 'sectionHeader',
              margin: [0, 20, 0, 10]
            },
            {
              stack: preServiceChecklist,
              margin: [0, 10, 0, 20]
            }
          ]
        },
        // Important Notes section
        {
          unbreakable: true,
          stack: [
            {
              text: sectionTitles.importantNotes[language],
              style: 'subHeader',
              margin: [0, 20, 0, 10]
            },
            {
              ul: importantNotes.map(note => note[language]),
              style: 'list'
            }
          ]
        }
      ],
      styles: {
        title: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          color: '#111827',
          margin: [0, 0, 0, 20]
        },
        headerCompany: {
          fontSize: 14,
          bold: true,
          color: '#111827',
          margin: [0, 0, 0, 10]
        },
        headerAddress: {
          fontSize: 9,
          color: '#4B5563',
          lineHeight: 1.2
        },
        headerDoc: {
          fontSize: 9,
          color: '#4B5563',
          lineHeight: 1.2,
          alignment: 'right'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#111827',
          fillColor: '#F9FAFB',
          margin: [10, 20, 10, 10]
        },
        subHeader: {
          fontSize: 12,
          bold: true,
          color: '#374151',
          margin: [0, 15, 0, 8]
        },
        label: {
          fontSize: 11,
          bold: true,
          color: '#374151'
        },
        list: {
          fontSize: 11,
          color: '#4B5563',
          lineHeight: 1.6,
          margin: [20, 0, 20, 0]
        }
      }
    };

    // Apply table layouts to all tables in the document
    const content = docDefinition.content as Content[];
    content.forEach((item) => {
      if (typeof item === 'object' && 'table' in item) {
        const tableItem = item as ContentTable;
        tableItem.layout = tableLayout.lightHorizontalLines;
      }
    });

    // Generate PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    return new Promise((resolve, reject) => {
      try {
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error loading PDF libraries:', error);
    throw error;
  }
} 