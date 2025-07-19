import React, { useState } from "react";
import SchemaBuilder from "./components/SchemaBuilder";
import { Typography } from "antd";

const { Title } = Typography;

function App() {
  const [fields, setFields] = useState([]);

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>JSON Schema Builder</Title>
      <SchemaBuilder fields={fields} setFields={setFields} />
    </div>
  );
}

export default App;