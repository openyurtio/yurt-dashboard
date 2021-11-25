import { Layout } from "antd";
import "./App.css";
import "./components/components.css";
import { Switch, Route, Redirect, BrowserRouter } from "react-router-dom";
import { routes } from "./config";
import {
  ContentWithSider,
  ContentWithoutSider,
} from "./components/Utils/ContentWrapper";

const App = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Switch>
          {routes.map((route, index) =>
            route.path === "/login" ? (
              <Route
                key={index}
                path={route.path}
                children={
                  <ContentWithoutSider
                    content={<route.main />}
                  ></ContentWithoutSider>
                }
              />
            ) : (
              <Route
                key={index}
                path={route.path}
                render={({ history }) => <ContentWithSider history={history} content={<route.main />} ></ContentWithSider>}
              />
            )
          )}
          <Redirect from="/" to="/login"></Redirect>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
