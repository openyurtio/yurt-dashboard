import React from 'react';
import { Pie } from '@ant-design/charts';

const mockData = {
  HealthyNum: 0,
  TotalNum: 1,
};

function getNormalNum(status) {
  return status && status.HealthyNum;
}

function getTotalNum(status) {
  return status && status.TotalNum;
}

function convertStatus(status) {
  return (
    status && [
      { type: '正常', value: status.HealthyNum },
      { type: '异常', value: status.TotalNum - status.HealthyNum },
    ]
  );
}

const generateConfig = (data, extendConfig) => {
  return {
    appendPadding: 10,
    data: data,
    angleField: 'value',
    colorField: 'type',
    color: ['#3e90ff', '#F74336'], // succ, fail
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
    },
    ...extendConfig,
  };
};

const PieChart = ({ name, status }) => {
  let data = status ? status : mockData;

  return (
    <div>
      {name}
      <Pie
        {...generateConfig(convertStatus(data), {
          width: 210,
          height: 220,
          radius: 1,
          innerRadius: 0.75,
          statistic: {
            title: false,
            content: {
              style: {
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: 18,
              },
              content: `${getNormalNum(data)}\n正常`,
            },
          },
          legend: {
            position: 'bottom',
            layout: 'vertical',
          },
        })}
      />
    </div>
  );
};

const HalfPieChart = ({ status }) => {
  let data = status ? status : mockData;
  return (
    <div>
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        正常：{getNormalNum(data)} <br />
        全部：{getTotalNum(data)}
      </div>
      <Pie
        {...generateConfig(convertStatus(data), {
          height: 150,
          startAngle: Math.PI,
          endAngle: Math.PI * 2,
          radius: 1,
          innerRadius: 0.5,
          statistic: {
            title: false,
            content: false,
          },
          legend: false,
        })}
      ></Pie>
    </div>
  );
};

export { PieChart, HalfPieChart };
