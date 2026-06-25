let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
if (!API_URL.endsWith('/api/v1')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api/v1';
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export const api = {
  getCategories: () => fetchAPI('/reference/categories'),
  getPersonas: () => fetchAPI('/reference/personas'),
  getScans: () => fetchAPI('/scans'),
  createScan: (payload: any) => {
    const backendPayload = {
      product_name: payload.productName,
      category_code: payload.category,
      persona_code: payload.persona,
      primary_benefit_idea: payload.benefitIdea,
      key_ingredient: payload.keyIngredient,
      target_price_tier: payload.priceTier,
      use_live_data: payload.useLiveData || false,
    };
    return fetchAPI('/scans', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },
  getScanStatus: (scanId: string) => fetchAPI(`/scans/${scanId}`),
  getWhitespace: (scanId: string) => fetchAPI(`/scans/${scanId}/whitespace`),
  getValuePropositions: (scanId: string) => fetchAPI(`/scans/${scanId}/value-propositions`),
  generateBrief: (scanId: string) => fetchAPI(`/scans/${scanId}/brief`, { method: 'POST' }),
  getFailureRisks: (scanId: string) => fetchAPI(`/scans/${scanId}/failure-risks`),
  getAuthenticTerritory: (scanId: string) => fetchAPI(`/scans/${scanId}/authentic-territory`),
};
