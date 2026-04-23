import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Home } from "@/pages/Home";
import BrowsePage from "@/pages/BrowsePage";
import Recs from "@/pages/Recs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          {/* 3D particle explorer — landing */}
          <Route path="/" component={Home} />
          {/* 2D browse — real movie cards from API */}
          <Route path="/browse" component={BrowsePage} />
          {/* AI recommendations */}
          <Route path="/recs" component={Recs} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
