import { useRoutes, Link } from "react-router-dom";
import 'antd/dist/antd.css';

import routes from './routes';
import './App.css'
import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  RiseOutlined,
  VideoCameraOutlined,
  DeliveredProcedureOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

function App() {
  const element = useRoutes(routes)
  const [collapsed, setCollapsed] = useState(false);

  const onChangeMenu = ({ item, key, keyPath, domEvent }) => {
  }

  return (
    <div className="App">
      <Layout style={{ height: "100vw" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: 'Algorithm',
                icon: <RiseOutlined />,
                label: <Link to="/algorithm">策略</Link>
              },
              {
                key: 'Quote',
                icon: <DeliveredProcedureOutlined />,
                label: <Link to="/quote">交易所api接口</Link>
              },
              {
                key: 'Login',
                icon: <UserOutlined />,
                label: <Link to="/login">Login</Link>
              },
            ]}
            onClick={onChangeMenu}
          />
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
            }}
          >
            {element}
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}

export default App
