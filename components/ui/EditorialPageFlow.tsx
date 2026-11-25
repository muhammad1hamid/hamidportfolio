import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { EditorialFAQ } from "./EditorialFAQ";

/** Keeps normal page flow and its margins around full-width FAQ sections. */
export function EditorialPageFlow({ children }: { children: ReactNode }) {
  const sections: ReactNode[] = [];
  let contained: ReactNode[] = [];
  function flush() {
    if (!contained.length) return;
    sections.push(
      <div className="wrap" key={`content-${sections.length}`}>
        {contained.map((node, index) => (
          <Fragment key={index}>{node}</Fragment>
        ))}
      </div>,
    );
    contained = [];
  }
  function collect(nodes: ReactNode) {
    Children.forEach(nodes, (node) => {
      if (
        isValidElement<{ children?: ReactNode }>(node) &&
        node.type === Fragment
      ) {
        collect(node.props.children);
      } else if (isValidElement(node) && node.type === EditorialFAQ) {
        flush();
        sections.push(
          <Fragment key={`faq-${sections.length}`}>{node}</Fragment>,
        );
      } else {
        contained.push(node);
      }
    });
  }
  collect(children);
  flush();
  return <>{sections}</>;
}
