import { apiClient, ApiError } from './api';
import { mockCompanies } from './mockData';
import { Company, ApiResponse } from '../types';

class CompanyService {
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    await this.delay(400);
    
    try {
      return {
        data: mockCompanies,
        success: true,
        message: 'Companies retrieved successfully'
      };
      
      // TODO: Replace with real API call
      // return apiClient.get<Company[]>('/companies');
    } catch (error) {
      throw new ApiError('Failed to fetch companies', 'FETCH_COMPANIES_ERROR');
    }
  }
  
  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    await this.delay(300);
    
    try {
      const company = mockCompanies.find(c => c.id === id);
      if (!company) {
        throw new ApiError('Company not found', 'COMPANY_NOT_FOUND');
      }
      
      return {
        data: company,
        success: true,
        message: 'Company retrieved successfully'
      };
      
      // TODO: Replace with real API call
      // return apiClient.get<Company>(`/companies/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch company', 'FETCH_COMPANY_ERROR');
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const companyService = new CompanyService();