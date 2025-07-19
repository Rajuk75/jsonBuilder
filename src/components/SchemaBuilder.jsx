import React from "react";
import { Button, Input, Select, Space, Switch, Row, Col, Card } from "antd";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

const fieldTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'float', label: 'Float' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'objectId', label: 'ObjectId' },
  { value: 'date', label: 'Date' },
  { value: 'array', label: 'Array' },
  { value: 'nested', label: 'Nested' }
];

// Function to generate random hex color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const defaultField = () => ({
  id: uuidv4(),
  key: '',
  type: 'string',
  required: false,
  children: []
});

const SchemaBuilder = ({ fields, setFields }) => {
  // Store random colors for each nested field
  const [buttonColors, setButtonColors] = React.useState({});

  const updateField = (id, prop, value, list = fields) => {
    return list.map(field => {
      if (field.id === id) {
        // If changing to nested type, generate a random color
        if (prop === 'type' && value === 'nested' && !buttonColors[id]) {
          setButtonColors(prev => ({ ...prev, [id]: getRandomColor() }));
        }
        return { ...field, [prop]: value };
      }
      if (field.children?.length) {
        return {
          ...field,
          children: updateField(id, prop, value, field.children)
        };
      }
      return field;
    });
  };

  const deleteField = (id, list = fields) => {
    if (buttonColors[id]) {
      const newColors = { ...buttonColors };
      delete newColors[id];
      setButtonColors(newColors);
    }
    return list
      .filter(field => field.id !== id)
      .map(field => ({
        ...field,
        children: deleteField(id, field.children || [])
      }));
  };

  const addField = (parentId = null, list = fields) => {
    if (!parentId) return [...fields, defaultField()];
    return list.map(field => {
      if (field.id === parentId) {
        return {
          ...field,
          children: [...(field.children || []), defaultField()]
        };
      }
      if (field.children?.length) {
        return {
          ...field,
          children: addField(parentId, field.children)
        };
      }
      return field;
    });
  };

  const buildJSON = (list = fields) => {
    const result = {};
    list.forEach(field => {
      if (!field.key) return;

      switch (field.type) {
        case 'string':
          result[field.key] = 'string';
          break;
        case 'number':
          result[field.key] = 'number';
          break;
        case 'float':
          result[field.key] = 'float';
          break;
        case 'boolean':
          result[field.key] = 'boolean';
          break;
        case 'objectId':
          result[field.key] = 'objectId';
          break;
        case 'date':
          result[field.key] = 'date';
          break;
        case 'array':
          result[field.key] = [];
          break;
        case 'nested':
          result[field.key] = buildJSON(field.children || []);
          break;
        default:
          result[field.key] = null;
      }
    });
    return result;
  };

  const renderFields = (list, parent = null) =>
    list.map(field => (
      <div key={field.id} style={{ 
        marginLeft: parent ? 20 : 0, 
        marginTop: 10, 
        borderLeft: parent ? '2px solid #ddd' : 'none', 
        paddingLeft: parent ? 10 : 0 
      }}>
        <Space wrap>
          <Input
            placeholder="Field Key"
            value={field.key}
            onChange={e => setFields(updateField(field.id, 'key', e.target.value))}
            style={{ width: 200 }}
          />
          <Select
            value={field.type}
            onChange={value => setFields(updateField(field.id, 'type', value))}
            style={{ width: 140 }}
            placeholder="Field Type"
          >
            {fieldTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
          <Switch
            checked={field.required}
            onChange={checked => setFields(updateField(field.id, 'required', checked))}
            checkedChildren="Required"
            unCheckedChildren="Optional"
          />
          <Button danger onClick={() => setFields(deleteField(field.id))}>
            Delete
          </Button>
        </Space>
        
        {field.children && renderFields(field.children, field)}
        
        {field.type === 'nested' && (
          <div style={{ marginTop: 10 }}>
            <Button
              onClick={() => setFields(addField(field.id))}
              style={{ 
                backgroundColor: buttonColors[field.id] || '#3b82f6',
                color: 'white',
                marginTop: 16,
                width: '100%'
              }}
            >
              + Add Nested Field
            </Button>
          </div>
        )}
      </div>
    ));

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="Schema Builder" style={{ marginBottom: 20 }}>
          {renderFields(fields)}
          <Button
            type="primary"
            onClick={() => setFields(addField())}
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white',
              marginTop: 16,
              width: '100%'
            }}
          >
            + Add Root Field
          </Button>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="JSON Preview">
          <pre>{JSON.stringify(buildJSON(fields), null, 2)}</pre>
        </Card>
      </Col>
    </Row>
  );
};

export default SchemaBuilder;