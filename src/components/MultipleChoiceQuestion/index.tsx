import { JSX, useState } from "react";

interface Option {
  id: string;
  text: string;
  element?: JSX.Element;
  isCorrect?: boolean;
}

interface MultipleChoiceQuestionProps {
  question: string;
  options: Option[];
  onSelect?: (selectedOption: Option) => void;
}

export default function MultipleChoiceQuestion({
  question,
  options,
  onSelect,
}: MultipleChoiceQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleOptionClick = (option: Option) => {
    setSelectedId(option.id);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        {question}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                maxWidth: "30px",
                minWidth: "20px",
                height: "20px",
                border:
                  "1px solid color-mix(in srgb, currentColor 50%, transparent)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontWeight: "bold",
              }}
            >
              {option.id}
            </div>
            <span
              style={{
                color: selectedId
                  ? option.isCorrect
                    ? "oklch(62.7% 0.194 149.214)"
                    : selectedId === option.id
                      ? "oklch(57.7% 0.245 27.325)"
                      : "inherit"
                  : "inherit",
                fontWeight:
                  selectedId && (option.id === selectedId || option.isCorrect)
                    ? "bold"
                    : "normal",
              }}
            >
              {option.element ?? option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
