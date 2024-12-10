'use client'

import React, { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { generatePDF } from '@/utils/generatePDF';
import { PDFPreviewModal } from './PDFPreviewModal';
import { Label } from "@/components/ui/label"

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
  training_hours: string;
}

type CheckboxId = 
  | 'system_flush'
  | 'safety_training'
  | 'harmless_form'
  | 'sds'
  | 'alignment_report'
  | 'operation_records'
  | 'power_isolation'
  | 'valves_locked'
  | 'pump_drained'
  | 'aux_systems'
  | 'coupling_guard'
  | 'coupling'
  | 'pump_cleaned'
  | 'openings_protected'
  | 'photos_taken';

export default function PumpServiceChecklist() {
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [formData, setFormData] = useState<FormData>({
    company: '',
    site_location: '',
    contact_person: '',
    department: '',
    phone: '',
    email: '',
    pump_model: '',
    serial_number: '',
    manufacture_year: '',
    operating_hours: '',
    last_service_date: '',
    installation_date: '',
    temperature: '',
    flow_rate: '',
    suction_pressure: '',
    discharge_pressure: '',
    total_head: '',
    pumped_medium: '',
    service_reason: '',
    training_hours: '',
  });

  const [checkboxes, setCheckboxes] = useState({
    system_flush: false,
    safety_training: false,
    harmless_form: false,
    sds: false,
    alignment_report: false,
    operation_records: false,
    power_isolation: false,
    valves_locked: false,
    pump_drained: false,
    aux_systems: false,
    coupling_guard: false,
    coupling: false,
    pump_cleaned: false,
    openings_protected: false,
    photos_taken: false,
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (id: CheckboxId) => {
    setCheckboxes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const pdfBlob = await generatePDF(formData, checkboxes, language);
      if (pdfBlob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(pdfUrl);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'en' 
        ? 'Error generating PDF. Please try again.' 
        : 'เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองอีกครั้ง');
    }
  };

  const handleDownload = () => {
    if (pdfPreviewUrl) {
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      link.download = 'pump-service-checklist.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmail = async (email: string) => {
    try {
      // Here you would implement the email sending logic
      // For now, we'll just show a success message
      alert(language === 'en' 
        ? `PDF would be sent to ${email}` 
        : `PDF จะถูกส่งไปที่ ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert(language === 'en' 
        ? 'Error sending email. Please try again.' 
        : 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองอีกครั้ง');
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Clean up the URL object to prevent memory leaks
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  const changeLanguage = (lang: 'en' | 'th') => {
    setLanguage(lang);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl max-w-5xl mx-auto">
      {/* Language Switcher */}
      <div className="border-b bg-gray-50/50">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {language === 'en' ? 'Pump Service Checklist' : 'รายการตรวจสอบการซ่อมบำรุงปั๊ม'}
          </h1>
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={() => changeLanguage('en')} 
              variant={language === 'en' ? "default" : "outline"}
              size="sm"
            >
              English
            </Button>
            <Button 
              type="button"
              onClick={() => changeLanguage('th')} 
              variant={language === 'th' ? "default" : "outline"}
              size="sm"
            >
              ไทย
            </Button>
          </div>
        </div>
      </div>

      {/* Company Header */}
      <div className="p-6 border-b">
        <div className="bg-gray-50/30 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="w-[200px] h-[100px] relative">
                <Image
                  src="/Logo.png"
                  alt={language === 'en' ? "Water Field Asia Co., Ltd. Logo" : "โลโก้ บริษัท วอเตอร์ฟิลด์ เอเชีย จำกัด"}
                  fill
                  sizes="200px"
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'en' ? "Water Field Asia Co., Ltd." : "บริษัท วอเตอร์ฟิลด์ เอเชีย จำกัด"}
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{language === 'en' ? "623 Soi Onnut 70/1 Sub 2" : "623 ซอยอ่อนนุช 70/1 แยก 2"}</p>
                  <p>{language === 'en' ? "Pravet Sub-District, Pravet District," : "แขวงประเวศ เขตประเวศ"}</p>
                  <p>{language === 'en' ? "Bangkok 10250" : "กรุงเทพมหานคร 10250"}</p>
                  <p>{language === 'en' ? "Tel.: +66 2320 1994" : "โทร: +66 2320 1994"}</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>{language === 'en' ? "Document No: FM-WFA-SER-057" : "เลขที่เอกสาร: FM-WFA-SER-057"}</p>
                <p>{language === 'en' ? "Revision: 00" : "แก้ไขครั้งที่: 00"}</p>
                <p>{language === 'en' ? "Date: 15.11.2024" : "วันที่: 15.11.2024"}</p>
              </div>
              <div className="w-[100px] h-[100px] relative ml-auto">
                <Image
                  src="/QR.jpeg"
                  alt={language === 'en' ? "QR Code" : "คิวอาร์โค้ด"}
                  fill
                  sizes="100px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-8">
        {/* Customer Details */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold pb-2 border-b text-gray-800">
            {language === 'en' ? '1. Customer Details' : '1. รายละเอียดลูกค้า'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-700">
                {language === 'en' ? 'Company Name' : 'ชื่อบริษัท'}
              </Label>
              <Input 
                id="company"
                type="text" 
                name="company" 
                value={formData.company}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_location" className="text-gray-700">
                {language === 'en' ? 'Site Location' : 'สถานที่ติดตั้ง'}
              </Label>
              <Input 
                id="site_location"
                type="text" 
                name="site_location" 
                value={formData.site_location}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-gray-700">
                {language === 'en' ? 'Contact Person' : 'ผู้ติดต่อ'}
              </Label>
              <Input 
                id="contact_person"
                type="text" 
                name="contact_person" 
                value={formData.contact_person}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700">
                {language === 'en' ? 'Department' : 'แผนก'}
              </Label>
              <Input 
                id="department"
                type="text" 
                name="department" 
                value={formData.department}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                {language === 'en' ? 'Phone' : 'เบอร์โทรศัพท์'}
              </Label>
              <Input 
                id="phone"
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                {language === 'en' ? 'Email' : 'อีเมล'}
              </Label>
              <Input 
                id="email"
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Pump Information */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold pb-2 border-b text-gray-800">
            {language === 'en' ? '2. Pump Information' : '2. ข้อมูลปั๊ม'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pump_model" className="text-gray-700">
                {language === 'en' ? 'Pump Model' : 'ประเภทปั๊ม'}
              </Label>
              <Input 
                id="pump_model"
                type="text" 
                name="pump_model" 
                value={formData.pump_model}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number" className="text-gray-700">
                {language === 'en' ? 'Serial Number' : 'หมายเลขเครื่อง'}
              </Label>
              <Input 
                id="serial_number"
                type="text" 
                name="serial_number" 
                value={formData.serial_number}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacture_year" className="text-gray-700">
                {language === 'en' ? 'Year of Manufacture' : 'ปีที่ผลิต'}
              </Label>
              <Input 
                id="manufacture_year"
                type="number" 
                name="manufacture_year" 
                value={formData.manufacture_year}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operating_hours" className="text-gray-700">
                {language === 'en' ? 'Operating Hours (if available)' : 'ชั่วโมงการทำงาน (ถ้ามี)'}
              </Label>
              <Input 
                id="operating_hours"
                type="number" 
                name="operating_hours" 
                value={formData.operating_hours}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_service_date" className="text-gray-700">
                {language === 'en' ? 'Last Service Date' : 'วันที่เข้าซ่อมครั้งล่าสุด'}
              </Label>
              <Input 
                id="last_service_date"
                type="date" 
                name="last_service_date" 
                value={formData.last_service_date}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installation_date" className="text-gray-700">
                {language === 'en' ? 'Installation Date' : 'วันที่ติดตั้ง'}
              </Label>
              <Input 
                id="installation_date"
                type="date" 
                name="installation_date" 
                value={formData.installation_date}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Operating Conditions */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold pb-2 border-b text-gray-800">
            {language === 'en' ? '3. Operating Conditions' : '3. สภาวะการทำงานจริง'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-gray-700">
                {language === 'en' ? 'Temperature (°C)' : 'อุณหภูมิ (°C)'}
              </Label>
              <Input 
                id="temperature"
                type="number" 
                name="temperature" 
                value={formData.temperature}
                onChange={handleInputChange}
                step="0.1"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow_rate" className="text-gray-700">
                {language === 'en' ? 'Flow Rate (m³/h)' : 'อัตราการไหล (m³/h)'}
              </Label>
              <Input 
                id="flow_rate"
                type="number" 
                name="flow_rate" 
                value={formData.flow_rate}
                onChange={handleInputChange}
                step="0.1"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suction_pressure" className="text-gray-700">
                {language === 'en' ? 'Suction Pressure (bar)' : 'แรงดันด้านดูด (bar)'}
              </Label>
              <Input 
                id="suction_pressure"
                type="number" 
                name="suction_pressure" 
                value={formData.suction_pressure}
                onChange={handleInputChange}
                step="0.1"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discharge_pressure" className="text-gray-700">
                {language === 'en' ? 'Discharge Pressure (bar)' : 'แรงดันด้านส่ง (bar)'}
              </Label>
              <Input 
                id="discharge_pressure"
                type="number" 
                name="discharge_pressure" 
                value={formData.discharge_pressure}
                onChange={handleInputChange}
                step="0.1"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_head" className="text-gray-700">
                {language === 'en' ? 'Total Head (m)' : 'เฮดรวม (m)'}
              </Label>
              <Input 
                id="total_head"
                type="number" 
                name="total_head" 
                value={formData.total_head}
                onChange={handleInputChange}
                step="0.1"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pumped_medium" className="text-gray-700">
                {language === 'en' ? 'Pumped Medium' : 'ของเหลวที่ส���บ'}
              </Label>
              <Input 
                id="pumped_medium"
                type="text" 
                name="pumped_medium" 
                value={formData.pumped_medium}
                onChange={handleInputChange}
                required 
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-6">
            <Label htmlFor="service_reason" className="text-gray-700 block mb-2">
              {language === 'en' ? 'Description of Issues/Reason for Service' : 'รายละเอียดปัญหา/เหตุผลในการเข้าซ่อม'}
            </Label>
            <Textarea 
              id="service_reason"
              name="service_reason" 
              value={formData.service_reason}
              onChange={handleInputChange}
              required 
              className="min-h-[100px] w-full"
            />
          </div>
        </section>

        {/* Checklist */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold pb-2 border-b text-gray-800">
            {language === 'en' ? '4. Customer Preparation Checklist' : '4. รายการเตรียมความพร้อมของลูกค้า'}
          </h2>
          <div className="space-y-6">
            {/* Pre-Service Requirements */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-800">
                {language === 'en' ? 'Pre-Service Requirements' : 'ข้อกำหนดก่อนเข้าซ่อม'}
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="system_flush" 
                    checked={checkboxes.system_flush}
                    onCheckedChange={() => handleCheckboxChange('system_flush')}
                  />
                  <Label htmlFor="system_flush" className="text-sm">
                    {language === 'en' 
                      ? 'System flushed (if hazardous/hardening materials)' 
                      : 'ล้างระบบแล้ว (กรณีสารอันตราย/สารที่แข็งตัว)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="safety_training" 
                    checked={checkboxes.safety_training}
                    onCheckedChange={() => handleCheckboxChange('safety_training')}
                  />
                  <Label htmlFor="safety_training" className="text-sm">
                    {language === 'en' 
                      ? 'Safety Training required?' 
                      : 'ต้องการการฝึกอบรมความปลอดภัยหรือไม่?'}
                  </Label>
                  <Input 
                    type="number" 
                    name="training_hours" 
                    placeholder={language === 'en' ? 'Hours' : 'ชั่วโมง'}
                    className="w-24 h-8 text-sm" 
                    value={formData.training_hours}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="harmless_form" 
                    checked={checkboxes.harmless_form}
                    onCheckedChange={() => handleCheckboxChange('harmless_form')}
                  />
                  <Label htmlFor="harmless_form" className="text-sm">
                    {language === 'en' 
                      ? 'Declaration of Harmlessness form (in the operation manual)' 
                      : 'แบบฟอร์มการประกาศความไม่เป็��อันตราย (ในคู่มือการใช้งาน)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="sds" 
                    checked={checkboxes.sds}
                    onCheckedChange={() => handleCheckboxChange('sds')}
                  />
                  <Label htmlFor="sds" className="text-sm">
                    {language === 'en' 
                      ? 'Safety Data Sheet (SDS) available' 
                      : 'มีเอกสารข้อมูลความปลอดภัย (SDS)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="alignment_report" 
                    checked={checkboxes.alignment_report}
                    onCheckedChange={() => handleCheckboxChange('alignment_report')}
                  />
                  <Label htmlFor="alignment_report" className="text-sm">
                    {language === 'en' 
                      ? 'Alignment report available' 
                      : 'มีรายงานการปรับแนวเพลา'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="operation_records" 
                    checked={checkboxes.operation_records}
                    onCheckedChange={() => handleCheckboxChange('operation_records')}
                  />
                  <Label htmlFor="operation_records" className="text-sm">
                    {language === 'en' 
                      ? 'Operation records available' 
                      : 'มีบันทึกการทำงาน'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Pump Preparation */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-800">
                {language === 'en' ? 'Pump Preparation (By Customer or WFA)' : 'การเตรียมปั๊ม (โดยลูกค้าหรือ WFA)'}
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="power_isolation" 
                    checked={checkboxes.power_isolation}
                    onCheckedChange={() => handleCheckboxChange('power_isolation')}
                  />
                  <Label htmlFor="power_isolation" className="text-sm">
                    {language === 'en' 
                      ? 'Pump isolated from power supply (customer responsibility)' 
                      : 'ตัดแยกปั๊มออกจากแหล่งจ่ายไฟ (ความรับผิดชอบของลูกค้า)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="valves_locked" 
                    checked={checkboxes.valves_locked}
                    onCheckedChange={() => handleCheckboxChange('valves_locked')}
                  />
                  <Label htmlFor="valves_locked" className="text-sm">
                    {language === 'en' 
                      ? 'Suction/discharge valves locked (customer responsibility)' 
                      : 'วาล์วด้านดูด/ด้านส่งถูกล็อก (ความรับผิดชอบของลูกค้า)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="pump_drained" 
                    checked={checkboxes.pump_drained}
                    onCheckedChange={() => handleCheckboxChange('pump_drained')}
                  />
                  <Label htmlFor="pump_drained" className="text-sm">
                    {language === 'en' 
                      ? 'Pump drained (customer responsibility)' 
                      : 'ระบายของเหลวออกจากปั๊ม (ความรับผิดชอบของลูกค้า)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="aux_systems" 
                    checked={checkboxes.aux_systems}
                    onCheckedChange={() => handleCheckboxChange('aux_systems')}
                  />
                  <Label htmlFor="aux_systems" className="text-sm">
                    {language === 'en' 
                      ? 'Auxiliary systems disconnected (e.g., external sensors)' 
                      : 'ตัดการเชื่อมต่อระบบที่เกี่ยวข้อง (เช่น เซนเซอร์ภายนอก)'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="coupling_guard" 
                    checked={checkboxes.coupling_guard}
                    onCheckedChange={() => handleCheckboxChange('coupling_guard')}
                  />
                  <Label htmlFor="coupling_guard" className="text-sm">
                    {language === 'en' 
                      ? 'Coupling guard removed' 
                      : 'ถอดฝาครอบคัปปลิ้ง'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="coupling" 
                    checked={checkboxes.coupling}
                    onCheckedChange={() => handleCheckboxChange('coupling')}
                  />
                  <Label htmlFor="coupling" className="text-sm">
                    {language === 'en' 
                      ? 'Coupling disconnected' 
                      : 'ถอดคัปปลิ้ง'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="pump_cleaned" 
                    checked={checkboxes.pump_cleaned}
                    onCheckedChange={() => handleCheckboxChange('pump_cleaned')}
                  />
                  <Label htmlFor="pump_cleaned" className="text-sm">
                    {language === 'en' 
                      ? 'Pump cleaned externally' 
                      : 'ทำความสะอาดภายนอกปั๊ม'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="openings_protected" 
                    checked={checkboxes.openings_protected}
                    onCheckedChange={() => handleCheckboxChange('openings_protected')}
                  />
                  <Label htmlFor="openings_protected" className="text-sm">
                    {language === 'en' 
                      ? 'All openings protected' 
                      : 'ป้องกันช่องเปิดทั้งหมด'}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="photos_taken" 
                    checked={checkboxes.photos_taken}
                    onCheckedChange={() => handleCheckboxChange('photos_taken')}
                  />
                  <Label htmlFor="photos_taken" className="text-sm">
                    {language === 'en' 
                      ? 'Photographs taken (if possible)' 
                      : 'ถ่ายภาพ (ถ้าเป็นไปได้)'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold pb-2 border-b text-gray-800">
            {language === 'en' ? 'Important Notes:' : 'หมายเหตุสำคัญ:'}
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <ul className="list-disc pl-5 space-y-3 text-gray-700">
              <li>{language === 'en' ? 'All work must be performed by qualified personnel only' : 'งานทั้งหมดต้องดำเนินการโดยบุคลากรที่มีคุณสมบัติเท่านั้น'}</li>
              <li>{language === 'en' ? 'Follow all safety protocols and guidelines' : 'ปฏิบัติตามขั้นตอนและแนวทางด้านความปลอดภัยทั้งหมด'}</li>
              <li>{language === 'en' ? 'Maintain proper documentation throughout the service process' : 'รักษาเกสารที่เหมาะสมตลอดกระบวนการให้บริการ'}</li>
              <li>{language === 'en' ? 'Use only OEM parts or approved equivalents' : 'ใช้เฉพาะชิ้นส่วน OEM หรือชิ้นส่วนที่ได้รับการอนุมัติเท่านั้น'}</li>
              <li>{language === 'en' ? 'Follow all safety protocols, especially regarding magnetic coupling hazards' : 'ปฏิบัติตามโปรโตคอลความปลอดภัยทั้งหมด โดยเฉพาะอย่างยิ่งเกี่ยวกับอันตรายจากการเชื่อมต่อแม่เหล็ก'}</li>
              <li>{language === 'en' ? "Refer to manufacturer's manual for specific torque values and clearances" : 'อ้างอิงคู่มือของผู้ผลิตสำหรับค่าแรงบิดและระยะห่างที่เฉพาะเจาะจง'}</li>
              <li>{language === 'en' ? 'Required for magnetic coupling handling - keep sensitive items at minimum 1m distance' : 'จำเป็นสำหรับการจัดการการเชื่อมต่อแม่เหล็ก - เก็บรักษาอุปกรณ์ที่มีความอ่อนไหวในระยะห่างอย่างน้อย 1 เมตร'}</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Submit Button */}
      <div className="border-t p-6 bg-gray-50/50">
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            {language === 'en' ? 'Generate PDF' : 'สร้าง PDF'}
          </Button>
        </div>
      </div>

      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={handleDownload}
        language={language}
        previewUrl={pdfPreviewUrl}
      />
    </form>
  );
}

