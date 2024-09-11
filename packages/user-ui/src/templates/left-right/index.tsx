import './left-right.css';

export interface LeftRightTemplateProps {
  header: () => JSX.Element;
  sidebar: () => JSX.Element;
  main: () => JSX.Element;
}

export function LeftRightTemplate(props: LeftRightTemplateProps) {
  return (
    <div className="left-right-template">
      <header>{props.header()}</header>
      <section>{props.sidebar()}</section>
      <main>{props.main()}</main>
    </div>
  )
}
