import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/chat.tsx";
import PageLayout_0 from "./pages/chat.pageLayout.tsx";
import Page_1 from "./pages/about.tsx";
import PageLayout_1 from "./pages/about.pageLayout.tsx";
import Page_2 from "./pages/goals.tsx";
import PageLayout_2 from "./pages/goals.pageLayout.tsx";
import Page_3 from "./pages/login.tsx";
import PageLayout_3 from "./pages/login.pageLayout.tsx";
import Page_4 from "./pages/terms.tsx";
import PageLayout_4 from "./pages/terms.pageLayout.tsx";
import Page_5 from "./pages/_index.tsx";
import PageLayout_5 from "./pages/_index.pageLayout.tsx";
import Page_6 from "./pages/travel.tsx";
import PageLayout_6 from "./pages/travel.pageLayout.tsx";
import Page_7 from "./pages/careers.tsx";
import PageLayout_7 from "./pages/careers.pageLayout.tsx";
import Page_8 from "./pages/contact.tsx";
import PageLayout_8 from "./pages/contact.pageLayout.tsx";
import Page_9 from "./pages/landing.tsx";
import PageLayout_9 from "./pages/landing.pageLayout.tsx";
import Page_10 from "./pages/pricing.tsx";
import PageLayout_10 from "./pages/pricing.pageLayout.tsx";
import Page_11 from "./pages/privacy.tsx";
import PageLayout_11 from "./pages/privacy.pageLayout.tsx";
import Page_12 from "./pages/profile.tsx";
import PageLayout_12 from "./pages/profile.pageLayout.tsx";
import Page_13 from "./pages/calendar.tsx";
import PageLayout_13 from "./pages/calendar.pageLayout.tsx";
import Page_14 from "./pages/register.tsx";
import PageLayout_14 from "./pages/register.pageLayout.tsx";
import Page_15 from "./pages/settings.tsx";
import PageLayout_15 from "./pages/settings.pageLayout.tsx";
import Page_16 from "./pages/shopping.tsx";
import PageLayout_16 from "./pages/shopping.pageLayout.tsx";
import Page_17 from "./pages/dashboard.tsx";
import PageLayout_17 from "./pages/dashboard.pageLayout.tsx";
import Page_18 from "./pages/settings.admin.tsx";
import PageLayout_18 from "./pages/settings.admin.pageLayout.tsx";
import Page_19 from "./pages/settings.privacy.tsx";
import PageLayout_19 from "./pages/settings.privacy.pageLayout.tsx";
import Page_20 from "./pages/settings.support.tsx";
import PageLayout_20 from "./pages/settings.support.pageLayout.tsx";
import Page_21 from "./pages/shopping.$listId.tsx";
import PageLayout_21 from "./pages/shopping.$listId.pageLayout.tsx";
import Page_22 from "./pages/settings.calendar.tsx";
import PageLayout_22 from "./pages/settings.calendar.pageLayout.tsx";
import Page_23 from "./pages/settings.appearance.tsx";
import PageLayout_23 from "./pages/settings.appearance.pageLayout.tsx";
import Page_24 from "./pages/settings.subscription.tsx";
import PageLayout_24 from "./pages/settings.subscription.pageLayout.tsx";
import Page_25 from "./pages/settings.notifications.tsx";
import PageLayout_25 from "./pages/settings.notifications.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/chat.tsx","/chat"],["./pages/about.tsx","/about"],["./pages/goals.tsx","/goals"],["./pages/login.tsx","/login"],["./pages/terms.tsx","/terms"],["./pages/_index.tsx","/"],["./pages/travel.tsx","/travel"],["./pages/careers.tsx","/careers"],["./pages/contact.tsx","/contact"],["./pages/landing.tsx","/landing"],["./pages/pricing.tsx","/pricing"],["./pages/privacy.tsx","/privacy"],["./pages/profile.tsx","/profile"],["./pages/calendar.tsx","/calendar"],["./pages/register.tsx","/register"],["./pages/settings.tsx","/settings"],["./pages/shopping.tsx","/shopping"],["./pages/dashboard.tsx","/dashboard"],["./pages/settings.admin.tsx","/settings/admin"],["./pages/settings.privacy.tsx","/settings/privacy"],["./pages/settings.support.tsx","/settings/support"],["./pages/shopping.$listId.tsx","/shopping/:listId"],["./pages/settings.calendar.tsx","/settings/calendar"],["./pages/settings.appearance.tsx","/settings/appearance"],["./pages/settings.subscription.tsx","/settings/subscription"],["./pages/settings.notifications.tsx","/settings/notifications"]]);
const fileNameToComponent = new Map([
    ["./pages/chat.tsx", Page_0],
["./pages/about.tsx", Page_1],
["./pages/goals.tsx", Page_2],
["./pages/login.tsx", Page_3],
["./pages/terms.tsx", Page_4],
["./pages/_index.tsx", Page_5],
["./pages/travel.tsx", Page_6],
["./pages/careers.tsx", Page_7],
["./pages/contact.tsx", Page_8],
["./pages/landing.tsx", Page_9],
["./pages/pricing.tsx", Page_10],
["./pages/privacy.tsx", Page_11],
["./pages/profile.tsx", Page_12],
["./pages/calendar.tsx", Page_13],
["./pages/register.tsx", Page_14],
["./pages/settings.tsx", Page_15],
["./pages/shopping.tsx", Page_16],
["./pages/dashboard.tsx", Page_17],
["./pages/settings.admin.tsx", Page_18],
["./pages/settings.privacy.tsx", Page_19],
["./pages/settings.support.tsx", Page_20],
["./pages/shopping.$listId.tsx", Page_21],
["./pages/settings.calendar.tsx", Page_22],
["./pages/settings.appearance.tsx", Page_23],
["./pages/settings.subscription.tsx", Page_24],
["./pages/settings.notifications.tsx", Page_25],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/chat.tsx": PageLayout_0,
"./pages/about.tsx": PageLayout_1,
"./pages/goals.tsx": PageLayout_2,
"./pages/login.tsx": PageLayout_3,
"./pages/terms.tsx": PageLayout_4,
"./pages/_index.tsx": PageLayout_5,
"./pages/travel.tsx": PageLayout_6,
"./pages/careers.tsx": PageLayout_7,
"./pages/contact.tsx": PageLayout_8,
"./pages/landing.tsx": PageLayout_9,
"./pages/pricing.tsx": PageLayout_10,
"./pages/privacy.tsx": PageLayout_11,
"./pages/profile.tsx": PageLayout_12,
"./pages/calendar.tsx": PageLayout_13,
"./pages/register.tsx": PageLayout_14,
"./pages/settings.tsx": PageLayout_15,
"./pages/shopping.tsx": PageLayout_16,
"./pages/dashboard.tsx": PageLayout_17,
"./pages/settings.admin.tsx": PageLayout_18,
"./pages/settings.privacy.tsx": PageLayout_19,
"./pages/settings.support.tsx": PageLayout_20,
"./pages/shopping.$listId.tsx": PageLayout_21,
"./pages/settings.calendar.tsx": PageLayout_22,
"./pages/settings.appearance.tsx": PageLayout_23,
"./pages/settings.subscription.tsx": PageLayout_24,
"./pages/settings.notifications.tsx": PageLayout_25,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
