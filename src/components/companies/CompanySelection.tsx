import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Search } from 'lucide-react';
import { Company, LoadingState } from '../../types';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const CompanySelection: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true, error: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
    console.log('Initial user state:', user);
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading({ isLoading: true, error: null });
      const response = await companyService.getCompanies();
      setCompanies(response.data);
    } catch (error: unknown) {
      const errorMessage = error.message || 'Failed to load companies';
      setLoading({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    if (!user) return;

    setSelectedCompany(companyId);

    try {
      let companyName = 'All Companies';

      if (companyId !== 'all') {
        const selectedCompanyData = companies.find(c => c.id === companyId);
        companyName = selectedCompanyData?.name || 'Unknown Company';
      }

      const updatedUser = { ...user, companyId, companyName };

      // Update user (this will persist to database)
      await updateUser(updatedUser);

      toast.success(`${companyName} selected successfully!`);

      // Navigate immediately - don't wait for state updates
      navigate('/vehicles', { replace: true });
    } catch (error: unknown) {
      console.error('Company selection error:', error);
      toast.error('Failed to select company');
      setSelectedCompany(null);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.motherCompany?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading companies..." />
      </div>
    );
  }

  if (loading.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{loading.error}</p>
          <button
            onClick={loadCompanies}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src="/logo_tchek-web.png"
            alt="Tchek.ai Logo"
            className="h-16 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Select Your Company
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the company you want to manage vehicle inspections for.
            You can change this selection later in your profile settings.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No companies found</p>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* All Companies Option */}
            <div className="max-w-md mx-auto">
              <div
                className={clsx(
                  'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg',
                  selectedCompany === 'all'
                    ? 'border-white bg-opacity-90'
                    : 'border-transparent hover:border-white hover:border-opacity-50'
                )}
                onClick={() => handleCompanySelect('all')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">All Companies</h3>
                      <p className="text-teal-100 text-sm">
                        Access all companies and vehicles
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>

                {selectedCompany === 'all' && (
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center justify-center gap-2 text-white">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm font-medium">Selecting all companies...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Companies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
                Or select a specific company:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className={clsx(
                  'bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg',
                  selectedCompany === company.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                )}
                onClick={() => handleCompanySelect(company.id)}
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
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-teal-600" />
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
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
                      <ArrowRight className={clsx(
                        'w-5 h-5 transition-colors',
                        selectedCompany === company.id ? 'text-teal-600' : 'text-gray-400'
                      )} />
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {company.address}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{company.email}</span>
                      <div className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                        {company.vehicleCount} vehicles
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCompany === company.id && (
                  <div className="mt-4 pt-4 border-t border-teal-200">
                    <div className="flex items-center justify-center gap-2 text-teal-600">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm font-medium">Selecting company...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Don't see your company? Contact your administrator to get access.
          </p>
        </div>
      </div>
    </div>
  );
};