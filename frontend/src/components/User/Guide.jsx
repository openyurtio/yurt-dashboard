import { Card, message } from 'antd';
import { useState } from 'react';
import { useUserProfile } from '../../utils/hooks';
import { sendRequest } from '../../utils/request';
import './Guide.css';
import { GuideSteps } from './GuideSteps/stepsConfig';

const GuidePage = ({ guideInfo, history }) => {
  // Specific guidance steps are implemented in the GuideSteps folder and registered in the stepsConfig file.
  // The guide step needs to accept the onStepFinish parameter. And called when step is complete.

  const [user, setUserProfile] = useUserProfile();
  if (user) {
    history.push('/clusterInfo');
  }

  const [currentStep, setCurrentStep] = useState(0);

  const onStepFinish = index => {
    const newIndex = index + 1;
    if (newIndex >= GuideSteps.length) {
      onGuideFinish();
    } else {
      setCurrentStep(newIndex);
    }
  };

  const onGuideFinish = () => {
    sendRequest('/guideComplete').then(
      res => {
        setUserProfile(res.data.user_info);
        history.push({
          pathname: '/clusterInfo',
          state: {
            msg: '恭喜您设置成功，请开始体验吧😀。',
            type: 'info',
            duration: 3,
          },
        });
      },
      err => {
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
          <div key={'guide-progress-' + index} className={index <= currentStep ? 'active' : ''}>
            <span>{item.title}</span>
            <span className="bottom-line" />
          </div>
        ))}
      </div>
      {GuideSteps.map((item, index) =>
        index === currentStep ? (
          <div key="guide-content" className="guide-step-content">
            <item.Content guideInfo={guideInfo} onStepFinish={() => onStepFinish(index)} />
          </div>
        ) : null
      )}
    </Card>
  );
};

export default GuidePage;
