import { sendRequest } from "../../utils/request";
import { withRouter } from "react-router-dom";
import { useUserProfile } from "../../utils/hooks";
import { useEffect, useState } from "react";
import Login from "./Login";
import Guide from "./Guide";
import { Spin } from "antd";

const EntryPage = ({ history }) => {
  const [userProfile, setUserProfile] = useUserProfile();
  if (userProfile) {
    history.push("/clusterInfo");
  }

  const [loading, setLoading] = useState(true);
  const [showPageLabel, setShowPageLabel] = useState("");
  const [guideInfo, setGuideInfo] = useState(null);

  const showPage = (label) => {
    setShowPageLabel(label);
    setLoading(false);
  };

  const initEntryInfo = () => {
    sendRequest("/initEntryInfo").then(
      (res) => {
        // show the login page if an error occurs or it is in experience center mode
        if (res.data === undefined || res.data.mode === "experience_center") {
          showPage("login");
          return;
        }

        // jump to the home page if the guidance has been completed and the user information has been obtained
        if (res.data.finish) {
          setUserProfile(res.data.user_info);
          history.push("/clusterInfo");
          return;
        } else {
          setGuideInfo(res.data.guide_info);
          showPage("guide");
          return;
        }
      },
      (err) => {
        console.log(err);
        showPage("login");
        return;
      }
    );
  };

  useEffect(() => {
    if (!userProfile) {
      initEntryInfo();
    }
  }, []);

  return loading ? (
    <div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Spin size="large" />
      </div>
    </div>
  ) : showPageLabel === "login" ? (
    <Login></Login>
  ) : showPageLabel === "guide" ? (
    <Guide history={history} guideInfo={guideInfo}></Guide>
  ) : (
    <div></div>
  );
};

export default withRouter(EntryPage);
