import React from "react";
import Collapsable from "./Collapsable";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const childrenArray = React.Children.toArray(children);
  const isOdd = childrenArray.length % 2 !== 0;

  return (
    <Collapsable title={title} open={true}>
      <section className="p-6 rounded-lg shadow-md">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className={`${
                isOdd && index === childrenArray.length - 1
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              {child}
            </div>
          ))}
        </div>
      </section>
    </Collapsable>
  );
};

export default Section;
