import React from 'react';
import { Building2, Users, Mail, Phone } from 'lucide-react';
import { Company } from '../../types';
import clsx from 'clsx';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => {
  return (
    <div 
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-blue-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {company.name}
              </h3>
              {company.motherCompany && (
                <p className="text-sm text-gray-500">
                  Part of {company.motherCompany}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                {company.vehicleCount}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {company.address}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate">{company.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{company.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};