import { MoreOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Button, Dropdown, Input, message, Modal, Select, Switch, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useUserProfile } from '../../utils/hooks';
import { getNodepools, getNodes, sendUserRequest } from '../../utils/request';
import { copy2clipboard, renderDictCell } from '../../utils/utils';
import RSelect from '../Utils/RefreshableSelect';
import STable from '../Utils/SelectableTable';
import { Status } from '../Utils/Status';

const { Option } = Select;
const { Search } = Input;
const { Paragraph, Link } = Typography;

// the Node panel
export default function Nodes() {
  // table columns
  const columns = [
    {
      title: <Trans>Name/IP Address/Instance ID</Trans>,
      dataIndex: 'title',
      render: node => {
        return (
          <div>
            <div>{node.Name}</div>
            <div>{node.IP}</div>
            <div>{node.uid}</div>
          </div>
        );
      },
    },
    {
      title: <Trans>Node Pool</Trans>,
      dataIndex: 'nodePool',
    },
    {
      title: <Trans>Role/Status</Trans>,
      dataIndex: 'role',
      render: node => {
        return (
          <div>
            {node.role}
            <Status
              status={node.condition.status === 'True' ? 'Ready' : 'Unready'}
              tips={node.condition.message}
            />
          </div>
        );
      },
    },
    {
      title: <Trans>Node Configuration</Trans>,
      dataIndex: 'config',
      render: node => renderDictCell(node),
    },
    {
      title: <Trans>Node Status</Trans>,
      dataIndex: 'status',
      render: node => renderDictCell(node),
    },
    {
      title: <Trans>Kubelet Version/Runtime Version/OS Version</Trans>,
      dataIndex: 'version',
      render: node => renderDictCell(node),
    },
    {
      title: <Trans>Creation Time</Trans>,
      dataIndex: 'createTime',
    },
    {
      title: <Trans>Operations</Trans>,
      dataIndex: 'operations',
      render: ({ Autonomy, NodeName }) => (
        <Dropdown
          placement="bottomCenter"
          menu={{
            items: [
              {
                key: '1',
                label: (
                  <div>
                    <Trans>Node Autonomy:</Trans>
                    <Switch
                      size="small"
                      defaultChecked={Autonomy === 'true'}
                      onChange={checked => {
                        sendUserRequest('/setNodeAutonomy', {
                          NodeName,
                          Autonomy: String(checked),
                        }).then(res => {
                          // if autonomy set fail, refresh the whole table
                          if (res.status === 'error') {
                            message.info(
                              <Trans>Node autonomy setting failed: refresh Node list</Trans>
                            );
                            onRefresh();
                          } else {
                            message.info(
                              <Trans>
                                Node autonomy setting successful: {checked ? 'ON' : 'OFF'}
                              </Trans>
                            );
                          }
                        });
                      }}
                    />
                  </div>
                ),
              },
            ],
          }}
        >
          <MoreOutlined style={{ cursor: 'pointer', width: '100%' }} />
        </Dropdown>
      ),
    },
  ];

  // filtering
  // for filter components
  const [searchOption, setOption] = useState('title');
  const [searchValue, setSearchVal] = useState('');
  const [selectedNp, setNp] = useState(<Trans>All Node Pools</Trans>);

  const [allNodes, setAllNodes] = useState(null); // all nodes
  const [nodes, setNodes] = useState(allNodes); // display nodes after filtering

  const filterNodes = (searchContent, selectedNodePool) => {
    const filterValue = searchContent || searchValue;
    const filterNp = selectedNodePool || selectedNp;

    setNodes(
      allNodes &&
        allNodes
          .filter(
            // filter by search value
            node => JSON.stringify(node[searchOption]).indexOf(filterValue) >= 0
            // searchOptions could be an Object
          )
          .filter(
            // filter by selected nodepool
            node => filterNp === <Trans>All Node Pools</Trans> || node.nodePool === filterNp
          )
    );
  };

  const onSearch = searchContent => {
    filterNodes(searchContent);
  };

  // filter options
  const options = [
    { content: <Trans>Name</Trans>, dataIndex: 'title' },
    { content: <Trans>Labels</Trans>, dataIndex: 'tag' },
    { content: <Trans>Annotations</Trans>, dataIndex: 'annotations' },
  ];

  // refresh the whole table and reset all filter options
  // Note: this won't update nodepool options ( this may cause problems )
  async function onRefresh() {
    setNodes(null);
    setSearchVal('');
    setOption('title');
    setNp(<Trans>All Node Pools</Trans>);
    return getNodes().then(nodes => {
      setAllNodes(nodes);
      setNodes(nodes);
    });
  }

  useEffect(() => {
    onRefresh();
  }, []);

  const filterComponents = (
    <div style={{ display: 'inline-block' }}>
      <Select defaultValue={searchOption} style={{ width: 80 }} onChange={val => setOption(val)}>
        {options.map((e, i) => (
          <Option key={i} value={e.dataIndex}>
            {e.content}
          </Option>
        ))}
      </Select>
      <Search
        placeholder="input search text"
        onSearch={onSearch}
        style={{ width: 200 }}
        value={searchValue}
        onChange={e => setSearchVal(e.target.value)}
      />

      <RSelect
        handleRefresh={useCallback(async () => {
          // add "All Node Pools" in select options anyway
          return getNodepools().then(nps => {
            return [<Trans>All Node Pools</Trans>, ...nps.map(np => np.title)];
          });
        }, [])}
        handleChange={selectedNodePool => {
          setNp(selectedNodePool);
          filterNodes(null, selectedNodePool);
        }}
        config={{
          style: { width: 120 },
          value: selectedNp,
        }}
      />
    </div>
  );

  // nodeaddscript modal
  const [visible, setVisible] = useState(false);
  const [userProfile] = useUserProfile();
  const nodeAddScript = userProfile ? (
    userProfile.spec.nodeAddScript
  ) : (
    <Trans>Failed to get join script, some issues occurred</Trans>
  );
  const onCancel = () => {
    setVisible(false);
  };

  return (
    <div className="content">
      <div>
        <h2 style={{ display: 'inline-block' }}>Node</h2>
        <Button
          type="default"
          style={{ float: 'right' }}
          onClick={() => {
            setVisible(true);
          }}
        >
          <Trans>Add Existing Node</Trans>
        </Button>
        {
          // display help information for users has no nodes joined
          allNodes && allNodes.length === 0 ? (
            <Paragraph>
              <blockquote>
                <Trans>Don't know how to add nodes😕? Refer to</Trans>
                <Link
                  href="https://openyurt.io/docs/installation/openyurt-experience-center/web_console"
                  target="_blank"
                >
                  <Trans>Documentation➡️</Trans>
                </Link>
                <Trans>Quick Start Experience Center</Trans>
              </blockquote>
            </Paragraph>
          ) : null
        }
      </div>

      <Modal
        visible={visible}
        title={<Trans>Node Join Script</Trans>}
        onCancel={onCancel}
        footer={[
          <Button
            key="copy"
            onClick={() => {
              copy2clipboard(nodeAddScript);
              setVisible(false);
            }}
          >
            <Trans>Copy and Close</Trans>
          </Button>,
          <Button key="close" type="primary" onClick={onCancel}>
            <Trans>Close</Trans>
          </Button>,
        ]}
      >
        {nodeAddScript}
      </Modal>

      <STable
        config={{
          columns: columns,
          data: nodes,
          filterComponents: filterComponents,
          onRefresh: onRefresh,
        }}
      />
    </div>
  );
}
