import React, { useState } from 'react';

const items = [
  { item: "V4 Kit", weight: 0.7, boxes: { "v4kit": 1, "9x8x4": 4, "cube": 10, "v4master": 20, "6pak": 42, "connectmast": 50 } },
  { item: "V4 Kit + Cables", weight: 1, boxes: { "v4kit": 1, "9x8x4": 4, "v4master": 10, "6pak": 15, "connectmast": 25 } },
  { item: "V4 Kit + Handheld Kit", weight: 3, boxes: { "9x8x4": 1, "cube": 2, "9pak": 9, "9pak-6": 6, "9pak-3": 3 } },
  { item: "V4 Kit + ZPass Kit", weight: 3, boxes: { "v4kit": 1, "9x8x4": 2, "6pak": 6, "9pak": 9, "9pak-6": 6, "9pak-3": 3 } },
  { item: "V4 Kit + Handheld Kit + ZPass Kit", weight: 5, boxes: { "9x8x4": 1, "cube": 2, "9pak": 9, "9pak-6": 6, "9pak-3": 3 } },
  { item: "Handheld Kit", weight: 2, boxes: { "9x8x4": 1, "cube": 2, "9pak": 9, "9pak-6": 6, "9pak-3": 3 } },
  { item: "Tablet Kit", weight: 4, boxes: { "samsungkit": 1, "samsung4pk": 4 } },
  { item: "Tablet Kit + V4 Kit", weight: 5, boxes: { "samsungkit": 1, "samsung4pk": 4 } },
  { item: "Tablet Kit + Camera", weight: 7, boxes: { "connectkit": 1, "connectmast": 4 } },
  { item: "Tablet Kit + Camera + V4 Kit", weight: 8, boxes: { "connectkit": 1, "connectmast": 4 } },
  { item: "Ztrak", weight: 0.5, boxes: { "9x8x4": 24, "square": 80, "v4master": 136 } },
  { item: "Cards", weight: 0.01, boxes: { "9x8x4": 600, "cube": 1200, "v4master": 2000 } },
  { item: "LDTCU", weight: 0.2, boxes: { "v4kit": 6, "9x8x4": 18, "10x10x5": 36, "cube": 72, "square": 80, "v4master": 200 } }
];

const templates = [
  { template: "v4kit", length: 12, width: 2, height: 7 },
  { template: "9x8x4", length: 9, width: 8, height: 4 },
  { template: "small", length: 10, width: 10, height: 4 },
  { template: "10x10x5", length: 10, width: 10, height: 5 },
  { template: "cube", length: 10, width: 10, height: 10 },
  { template: "square", length: 14, width: 14, height: 6 },
  { template: "v4master", length: 21, width: 12, height: 7 },
  { template: "6pak", length: 21, width: 11, height: 15 },
  { template: "9pak", length: 27, width: 10, height: 15 },
  { template: "9pak-6", length: 27, width: 10, height: 10 },
  { template: "9pak-3", length: 27, width: 10, height: 5 },
  { template: "samsungkit", length: 7, width: 11, height: 11 },
  { template: "samsung4pk", length: 23, width: 15, height: 11 },
  { template: "connectkit", length: 12, width: 11, height: 8 },
  { template: "connectmast", length: 22, width: 12, height: 16 }
];

const RateQuoteTool = () => {
  const [entries, setEntries] = useState({});
  const [boxes, setBoxes] = useState([]);

  const handleInputChange = (item, value) => {
    setEntries({ ...entries, [item]: value });
  };

  const handleEnter = () => {
    const data = { ...entries };
    buildBoxes(data);
  };

  const buildBoxes = (data) => {
    const newBoxes = [];
    for (const sku in data) {
      const item = items.find(i => i.item === sku);
      if (item && data[sku] !== "") {
        let remainingQty = parseInt(data[sku], 10);
        for (const key of Object.keys(item.boxes).sort((a, b) => item.boxes[b] - item.boxes[a])) {
          while (remainingQty >= item.boxes[key] && item.boxes[key] !== 0) {
            newBoxes.push({ template: key, weight: item.weight * item.boxes[key] });
            remainingQty -= item.boxes[key];
          }
          if (remainingQty > 0) {
            let bestBox = null;
            for (const smallKey in item.boxes) {
              if (item.boxes[smallKey] !== 0 && item.boxes[smallKey] >= remainingQty) {
                if (!bestBox || item.boxes[smallKey] < item.boxes[bestBox]) {
                  bestBox = smallKey;
                }
              }
            }
            if (bestBox) {
              newBoxes.push({ template: bestBox, weight: item.weight * remainingQty });
              remainingQty = 0;
            }
          }
        }
      }
    }
    setBoxes(newBoxes);
  };

  const handleCopy = () => {
    const boxStrings = boxes.map(box => {
      const template = templates.find(t => t.template === box.template);
      if (template) {
        if (box.template === "9pak-3" || box.template === "9pak-6") {
          return `9pak\t${template.length}\t${template.width}\t${template.height}\tINCH\t${box.weight}\tOZ\n`;
        } else {
          return `${box.template}\t${template.length}\t${template.width}\t${template.height}\tINCH\t${box.weight}\tLB\n`;
        }
      }
      return "";
    }).join("\n");
    navigator.clipboard.writeText(boxStrings);
    setBoxes([]);
    setEntries({});
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Freight Quote Tool</h1>
      <div style={{ marginBottom: '20px' }}>
        {items.map(item => (
          <div key={item.item} style={{ display: 'flex', marginBottom: '10px' }}>
            <label style={{ width: '200px' }}>{item.item}</label>
            <input
              type="number"
              value={entries[item.item] || ""}
              onChange={(e) => handleInputChange(item.item, e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleEnter} style={{ marginRight: '10px' }}>Enter</button>
        <button onClick={handleCopy}>Copy</button>
      </div>
    </div>
  );
};

export default RateQuoteTool;