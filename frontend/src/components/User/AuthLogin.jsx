import { withRouter } from "react-router-dom";

const GithubLoginFinish = ({ history }) => {
  history.push({
    pathname: "/clusterInfo",
    state: {
      type: "info",
      duration: 3,
    },
  });
  return <></>;
};

export default withRouter(GithubLoginFinish);
