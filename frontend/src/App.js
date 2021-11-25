import { Layout } from "antd";
import "./App.css";
import "./components/components.css";
import { Switch, Route, Redirect } from "react-router-dom";
import { routes } from "./config";
import {
  ContentWithSider,
  ContentWithoutSider,
} from "./components/Utils/ContentWrapper";

const App = () => {
  return (
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
              children={
                <ContentWithSider content={<route.main />}></ContentWithSider>
              }
            />
          )
        )}
        <Redirect from="/" to="/login"></Redirect>
      </Switch>
    </Layout>
  );
};

export default App;
