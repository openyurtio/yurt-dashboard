import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Layout, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import './components/components.css';

import { ContentWithSider, ContentWithoutSider } from './components/Utils/ContentWrapper';
import { routes } from './config';
import AdminRoute from './utils/adminRoute';
import { dynamicActivate, getInitialLocale } from './utils/i18n';

const App = () => {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      const locale = localStorage.getItem('preferredLanguage') || getInitialLocale();
      await dynamicActivate(locale);
      setI18nInitialized(true);
    };
    initI18n();
  }, []);

  if (!i18nInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Routes>
            {routes.map((route, index) =>
              route.path === '/login' ? (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ContentWithoutSider>
                      <route.main />
                    </ContentWithoutSider>
                  }
                />
              ) : route.type && route.type === 'admin' ? (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <AdminRoute>
                      <ContentWithSider>
                        <route.main />
                      </ContentWithSider>
                    </AdminRoute>
                  }
                />
              ) : (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ContentWithSider>
                      <route.main />
                    </ContentWithSider>
                  }
                />
              )
            )}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </I18nProvider>
  );
};

export default App;
