"use client";

import Image from "next/image";
import { FaWeixin } from "react-icons/fa";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

export default function ContactInfoSection() {
  const { companyInfo } = useCompanyInfo();

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#8DC63F] transition-colors">
        <div className="flex-shrink-0">
          <Image 
            src="/svg/email-logo.svg" 
            alt="Email" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Имэйл</h3>
          <a
            href={`mailto:${companyInfo.email}`}
            className="text-[#8DC63F] hover:text-[#7AB82E] hover:underline transition-colors"
          >
            {companyInfo.email}
          </a>
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#8DC63F] transition-colors">
        <div className="flex-shrink-0">
          <Image 
            src="/svg/phone-logo.svg" 
            alt="Phone" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Утас</h3>
          <a
            href={`tel:${companyInfo.phone}`}
            className="text-[#8DC63F] hover:text-[#7AB82E] hover:underline transition-colors"
          >
            {companyInfo.phone}
          </a>
        </div>
      </div>

      {companyInfo.mobilePhone ? (
        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#8DC63F] transition-colors">
          <div className="flex-shrink-0">
            <Image 
              src="/svg/phone-logo.svg" 
              alt="Mobile phone" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Гар утас</h3>
            <a
              href={`tel:${companyInfo.mobilePhone}`}
              className="text-[#8DC63F] hover:text-[#7AB82E] hover:underline transition-colors"
            >
              {companyInfo.mobilePhone}
            </a>
          </div>
        </div>
      ) : null}

      {/* Social Media */}
      <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-gray-600">📱</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Сошиал хаягууд</h3>
          <div className="flex items-center gap-4">
            <a
              href={companyInfo.facebookUrl || "#"}
              className="hover:opacity-80 transition-opacity"
              target={companyInfo.facebookUrl ? "_blank" : undefined}
              rel={companyInfo.facebookUrl ? "noopener noreferrer" : undefined}
            >
              <Image 
                src="/svg/fb-logo.svg" 
                alt="Facebook" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
            </a>
            {companyInfo.wechatUrl ? (
              <a
                href={companyInfo.wechatUrl}
                className="hover:opacity-80 transition-opacity text-[#07C160]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeChat"
              >
                <FaWeixin className="w-8 h-8" />
              </a>
            ) : null}
            <a
              href={companyInfo.whatsappUrl || "#"}
              className="hover:opacity-80 transition-opacity"
              target={companyInfo.whatsappUrl ? "_blank" : undefined}
              rel={companyInfo.whatsappUrl ? "noopener noreferrer" : undefined}
            >
              <Image 
                src="/svg/whatsupp-log.svg" 
                alt="WhatsApp" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
