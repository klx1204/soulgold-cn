import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Pokedex from "./pages/Pokedex";
import SpeciesDetail from "./pages/SpeciesDetail";
import Moves from "./pages/Moves";
import MoveDetail from "./pages/MoveDetail";
import Abilities from "./pages/Abilities";
import AbilityDetail from "./pages/AbilityDetail";
import Items from "./pages/Items";
import ItemDetail from "./pages/ItemDetail";
import Encounters from "./pages/Encounters";
import EncounterDetail from "./pages/EncounterDetail";
import Machines from "./pages/Machines";
import Trainers from "./pages/Trainers";
import TrainerDetail from "./pages/TrainerDetail";
import Frontier from "./pages/Frontier";
import Guides from "./pages/Guides";
import GuideDetail from "./pages/GuideDetail";
import SearchPage from "./pages/Search";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pokedex" element={<Pokedex />} />
        <Route path="pokedex/:slug" element={<SpeciesDetail />} />
        <Route path="moves" element={<Moves />} />
        <Route path="moves/:slug" element={<MoveDetail />} />
        <Route path="abilities" element={<Abilities />} />
        <Route path="abilities/:slug" element={<AbilityDetail />} />
        <Route path="items" element={<Items />} />
        <Route path="items/:slug" element={<ItemDetail />} />
        <Route path="encounters" element={<Encounters />} />
        <Route path="encounters/:map" element={<EncounterDetail />} />
        <Route path="machines" element={<Machines />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="trainers/:constant" element={<TrainerDetail />} />
        <Route path="frontier" element={<Frontier />} />
        <Route path="guides" element={<Guides />} />
        <Route path="guides/:slug" element={<GuideDetail />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
