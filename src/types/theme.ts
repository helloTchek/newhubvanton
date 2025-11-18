export interface ThemeConfiguration {
  id: string;
  companyId: string;
  logoUrl: string;
  logoDarkUrl?: string;
  primaryColor: string;
  accentColor: string;
  dominantColor: string;
  textPrimaryColor: string;
  backgroundPrimaryColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ThemeConfigurationInput {
  companyId: string;
  logoUrl: string;
  logoDarkUrl?: string;
  primaryColor: string;
  accentColor: string;
  dominantColor: string;
  textPrimaryColor: string;
  backgroundPrimaryColor: string;
}
