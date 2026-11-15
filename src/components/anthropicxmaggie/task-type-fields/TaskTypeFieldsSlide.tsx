import TaskTypeDivider from "./TaskTypeDivider";
import SolutionsVision from "./SolutionsVision";
import CurrentFields from "./CurrentFields";
import TaskTypeFields from "./TaskTypeFields";
import CustomerFeedback from "./CustomerFeedback";
import EditingAudit from "./EditingAudit";
import FormComplexity from "./FormComplexity";
import KeyIterations from "./KeyIterations";
import FieldSurfaces from "./FieldSurfaces";
import TestingTerminology from "./TestingTerminology";
import LeadershipDebate from "./LeadershipDebate";
import DemoDivider from "./DemoDivider";
import SpecsBeforeCodedHandoffs from "./SpecsBeforeCodedHandoffs";
import DesignCollage from "./DesignCollage";
import EngineeringLayout from "./EngineeringLayout";
import OpportunityLayout from "./OpportunityLayout";
import CompanyLayout from "./CompanyLayout";
import "./TaskTypeFields.css";

const taskTypeFieldsSlides = [
  { number: 4.66001, Component: TaskTypeDivider },
  { number: 4.66002, Component: SolutionsVision },
  { number: 4.66003, Component: CurrentFields },
  { number: 4.66004, Component: TaskTypeFields },
  { number: 4.66005, Component: CustomerFeedback },
  { number: 4.66006, Component: EditingAudit },
  { number: 4.66007, Component: FormComplexity },
  { number: 4.66008, Component: KeyIterations },
  { number: 4.66009, Component: FieldSurfaces },
  { number: 4.66010, Component: TestingTerminology },
  { number: 4.66011, Component: LeadershipDebate },
  { number: 4.660115, Component: LeadershipDebate, highlightLeftPanel: true },
  { number: 4.66012, Component: DemoDivider },
  { number: 4.660125, Component: SpecsBeforeCodedHandoffs },
  { number: 4.66013, Component: DesignCollage },
  { number: 4.66014, Component: EngineeringLayout },
  { number: 4.66015, Component: OpportunityLayout },
  { number: 4.66016, Component: CompanyLayout },
] as const;

export default function TaskTypeFieldsSlide({ number }: { number: number }) {
  const slide = taskTypeFieldsSlides.find(entry => entry.number === number);
  if (!slide) return null;
  return <div className={`axm-task-type-fields${"highlightLeftPanel" in slide ? " axm-task-type-fields--highlight-left" : ""}`}><slide.Component /></div>;
}
