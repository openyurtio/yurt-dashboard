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
import './nodes.css';

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
            width: 200,
            render: node => {
                return (
                    <div className="node-name-cell">
                        <div style={{ fontWeight: 'bold' }}>{node.Name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{node.IP}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>{node.uid}</div>
                    </div>
                );
            },
        },
        {
            title: <Trans>Node Pool</Trans>,
            dataIndex: 'nodePool',
            width: 120,
            responsive: ['md'],
        },
        {
            title: <Trans>Role/Status</Trans>,
            dataIndex: 'role',
            width: 150,
            render: node => {
                return (
                    <div className="node-status-cell">
                        <div style={{ marginBottom: '4px' }}>{node.role}</div>
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
            width: 180,
            responsive: ['lg'],
            render: node => renderDictCell(node),
        },
        {
            title: <Trans>Node Status</Trans>,
            dataIndex: 'status',
            width: 180,
            responsive: ['xl'],
            render: node => renderDictCell(node),
        },
        {
            title: <Trans>Kubelet Version/Runtime Version/OS Version</Trans>,
            dataIndex: 'version',
            width: 200,
            responsive: ['xl'],
            render: node => renderDictCell(node),
        },
        {
            title: <Trans>Creation Time</Trans>,
            dataIndex: 'createTime',
            width: 150,
            responsive: ['lg'],
        },
        {
            title: <Trans>Operations</Trans>,
            dataIndex: 'operations',
            width: 100,
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
        <div
            className="node-filters"
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '8px'
            }}
        >
            <Select
                defaultValue={searchOption}
                style={{
                    width: '100px',
                    minWidth: '80px'
                }}
                onChange={val => setOption(val)}
            >
                {options.map((e, i) => (
                    <Option key={i} value={e.dataIndex}>
                        {e.content}
                    </Option>
                ))}
            </Select>
            <Search
                placeholder="input search text"
                onSearch={onSearch}
                style={{
                    width: '240px',
                    maxWidth: '100%',
                    minWidth: '200px',
                    flex: '1 1 200px'
                }}
                value={searchValue}
                onChange={e => setSearchVal(e.target.value)}
            />

            <div style={{ minWidth: '140px' }}>
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
                        style: { width: '120px' },
                        value: selectedNp,
                    }}
                />
            </div>
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
            <div
                className="node-header"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    gap: '12px'
                }}
            >
                <h2 style={{ margin: 0, flex: '1 1 auto' }}>Node</h2>
                <Button
                    type="default"
                    style={{
                        flexShrink: 0,
                        minWidth: 'fit-content'
                    }}
                    onClick={() => {
                        setVisible(true);
                    }}
                >
                    <Trans>Add Existing Node</Trans>
                </Button>
            </div>
            {
                // display help information for users has no nodes joined
                allNodes && allNodes.length === 0 ? (
                    <Paragraph style={{ marginBottom: '16px' }}>
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

            <Modal
                open={visible}
                title={<Trans>Node Join Script</Trans>}
                onCancel={onCancel}
                width="90%"
                style={{ maxWidth: '800px' }}
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
                <pre
                    className="node-script-modal"
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        maxHeight: '400px',
                        overflow: 'auto'
                    }}
                >
                    {nodeAddScript}
                </pre>
            </Modal>

            <STable
                config={{
                    columns: columns,
                    data: nodes,
                    filterComponents: filterComponents,
                    onRefresh: onRefresh,
                    tableProps: {
                        scroll: { x: 1200 },
                        size: 'small',
                        pagination: {
                            responsive: true,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            defaultPageSize: 20,
                        },
                    },
                }}
            />
        </div>
    );
}
