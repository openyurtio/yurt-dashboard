import { Card, message } from "antd";
import "./Guide.css";
import { sendRequest } from "../../utils/request";
import { useUserProfile } from "../../utils/hooks";
import { useState } from "react";
import { GuideSteps } from "./GuideSteps/stepsConfig";

const GuidePage = ({ guideInfo, history }) => {
  let [user, setUserProfile] = useUserProfile();
  if (user) {
    history.push("/clusterInfo");
  }

  const [currentStep, setCurrentStep] = useState(0);

  const onStepFinish = (index) => {
    let newIndex = index + 1;
    if (newIndex >= GuideSteps.length) {
      onGuideFinish();
    } else {
      setCurrentStep(newIndex);
    }
  };

  const onGuideFinish = () => {
    sendRequest("/guideComplete").then(
      (res) => {
        setUserProfile(res.data.user_info);
        history.push({
          pathname: "/clusterInfo",
          state: {
            msg: "恭喜您设置成功，请开始体验吧😀。",
            type: "info",
            duration: 3,
          },
        });
      },
      (err) => {
        console.log(err);
        message.error(err.message);
      }
    );
  };

  return (
    <Card className="guide-content">
      <div className="guide-title-box">快速设置</div>
      <div className="guide-progress-box">
        {GuideSteps.map((item, index) => (
          <div
            key={"guide-progress-" + index}
            className={index <= currentStep ? "active" : ""}
          >
            <span>{item.title}</span>
            <span className="bottom-line" />
          </div>
        ))}
      </div>
      {GuideSteps.map((item, index) =>
        index === currentStep ? (
          <div key="guide-content" className="guide-step-content">
            <item.Content
              guideInfo={guideInfo}
              onStepFinish={() => onStepFinish(index)}
            />
          </div>
        ) : null
      )}
    </Card>
  );
};

export default GuidePage;
