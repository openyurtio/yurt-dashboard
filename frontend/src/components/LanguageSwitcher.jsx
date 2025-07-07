import { useLingui } from '@lingui/react';
import { Select } from 'antd';
import { SUPPORTED_LANGUAGES } from '../constants/i18n';

const { Option } = Select;

export default function LanguageSwitcher() {
  const { i18n } = useLingui();

  const handleLanguageChange = value => {
    i18n.activate(value);
    localStorage.setItem('preferredLanguage', value);
  };

  return (
    <Select value={i18n.locale} onChange={handleLanguageChange} style={{ width: 120 }}>
      {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
        <Option key={code} value={code}>
          {language.full}
        </Option>
      ))}
    </Select>
  );
}
