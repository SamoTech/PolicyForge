// Types only — data is fetched dynamically from GitHub at runtime.
// DO NOT add hardcoded policy arrays here.

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Policy {
  id:             string;
  name:           string;
  category:       string;
  risk_level:     RiskLevel;
  mitre:          string[];
  registry_path:  string;
  registry_value: string;
  oma_uri:        string;
  powershell:     string;
  description:    string;
  compliance:     string[];
  applies_to:     string;
  raw:            string;
  source_url:     string;
}

export const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];
