import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>{children}</div>;
}

function Tab({ index, children }) {
  // 👉 The Tab component is missing the context!
  // 1. Get `activeTab` and `setActiveTab` from TabsContext.
  // 2. Change the button's background based on `activeTab === index`.
  // 3. Call `setActiveTab(index)` when clicked.
  
  const isActive = false;

  return (
    <button 
      style={{ 
        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
        background: isActive ? '#007bff' : '#eee',
        color: isActive ? 'white' : 'black'
      }}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div style={{ padding: '20px' }}>{children}</div>;
}

function TabPanel({ index, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== index) return null;
  return <div>{children}</div>;
}

// Assign them as properties for that sweet <Tabs.Tab> syntax
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export default function App() {
  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Tab index={0}>Profile</Tabs.Tab>
        <Tabs.Tab index={1}>Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel index={0}>User Profile Details here.</Tabs.Panel>
        <Tabs.Panel index={1}>Account Settings here.</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
