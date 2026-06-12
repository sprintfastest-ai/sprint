import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { DesignSystem } from "./pages/DesignSystem";
import { ComponentLibrary } from "./pages/ComponentLibrary";
import { BadgeGallery } from "./pages/BadgeGallery";
import { LoginScreen } from "./pages/LoginScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { PersonalBests } from "./pages/PersonalBests";
import { HomeScreen } from "./pages/HomeScreen";
import { TrainingPlan } from "./pages/TrainingPlan";
import { DiagnosisQuiz } from "./pages/DiagnosisQuiz";
import { DiagnosisResults } from "./pages/DiagnosisResults";
import { ChatCoach } from "./pages/ChatCoach";
import { ProgressTracker } from "./pages/ProgressTracker";
import { LogTime } from "./pages/LogTime";
import { Achievements } from "./pages/Achievements";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true,          Component: DesignSystem     },
      { path: "components",   Component: ComponentLibrary },
      { path: "badges",       Component: BadgeGallery     },
      { path: "login",        Component: LoginScreen      },
      { path: "register",     Component: RegisterScreen   },
      { path: "personal-bests", Component: PersonalBests  },
      { path: "home-screen",    Component: HomeScreen    },
      { path: "training-plan",  Component: TrainingPlan  },
      { path: "diagnosis-quiz",    Component: DiagnosisQuiz    },
      { path: "diagnosis-results", Component: DiagnosisResults },
      { path: "chat-coach",        Component: ChatCoach        },
      { path: "progress-tracker",  Component: ProgressTracker  },
      { path: "log-time",          Component: LogTime          },
      { path: "achievements",      Component: Achievements     },
    ],
  },
]);
