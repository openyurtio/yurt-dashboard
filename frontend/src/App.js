import { Layout } from 'antd';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import './components/components.css';

import { ContentWithSider, ContentWithoutSider } from './components/Utils/ContentWrapper';
import { routes } from './config';
import AdminRoute from './utils/adminRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Switch>
          {routes.map((route, index) =>
            route.path === '/login' ? (
              <Route key={index} path={route.path}>
                <ContentWithoutSider>
                  <route.main />
                </ContentWithoutSider>
              </Route>
            ) : route.type && route.type === 'admin' ? (
              <AdminRoute
                key={index}
                path={route.path}
                render={({ history }) => (
                  <ContentWithSider history={history}>
                    <route.main />
                  </ContentWithSider>
                )}
              />
            ) : (
              <Route
                key={index}
                path={route.path}
                render={({ history }) => (
                  <ContentWithSider history={history}>
                    <route.main />
                  </ContentWithSider>
                )}
              />
            )
          )}
          <Redirect from="/" to="/login" />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
