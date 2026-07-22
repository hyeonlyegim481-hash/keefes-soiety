import test from "node:test";
import assert from "node:assert/strict";

import {
  bookCategories,
  bookLevels,
  economicsBooks,
  officialResources,
  readingRoutes,
  resourceCategories,
  resourceRegions
} from "./resource-library-data.js";

test("book recommendations are complete, unique, and cover every reading level", () => {
  assert.ok(economicsBooks.length >= 15);
  assert.equal(new Set(economicsBooks.map((book) => book.id)).size, economicsBooks.length);
  assert.equal(new Set(economicsBooks.map((book) => book.title)).size, economicsBooks.length);

  for (const book of economicsBooks) {
    assert.ok(bookLevels.includes(book.level), `${book.id}: unknown level`);
    assert.ok(bookCategories.includes(book.category), `${book.id}: unknown category`);
    assert.ok(book.oneLine.length >= 30, `${book.id}: short summary`);
    assert.ok(book.why.length >= 40, `${book.id}: short recommendation reason`);
    assert.ok(book.learn.length >= 3, `${book.id}: missing learning points`);
    assert.ok(book.caution.length >= 30, `${book.id}: missing caution`);
  }
});

test("reading routes only point to known books and contain three distinct steps", () => {
  const knownBookIds = new Set(economicsBooks.map((book) => book.id));
  assert.ok(readingRoutes.length >= 4);

  for (const route of readingRoutes) {
    assert.equal(route.bookIds.length, 3, `${route.id}: route should contain three books`);
    assert.equal(new Set(route.bookIds).size, route.bookIds.length, `${route.id}: duplicate book`);
    route.bookIds.forEach((bookId) => assert.ok(knownBookIds.has(bookId), `${route.id}: unknown ${bookId}`));
  }
});

test("official directory has broad Korean and world coverage with valid metadata", () => {
  assert.ok(officialResources.length >= 28);
  assert.equal(new Set(officialResources.map((resource) => resource.id)).size, officialResources.length);
  assert.ok(officialResources.filter((resource) => resource.region === "한국").length >= 12);
  assert.ok(officialResources.filter((resource) => resource.region === "세계").length >= 14);
  assert.ok(officialResources.filter((resource) => resource.category === "광물·지도").length >= 4);
  assert.ok(officialResources.filter((resource) => resource.category === "에너지·기후").length >= 6);

  for (const resource of officialResources) {
    assert.ok(resourceRegions.includes(resource.region), `${resource.id}: unknown region`);
    assert.ok(resourceCategories.includes(resource.category), `${resource.id}: unknown category`);
    assert.ok(resource.description.length >= 30, `${resource.id}: short description`);
    assert.ok(resource.useFor.length >= 3, `${resource.id}: missing use cases`);
    assert.ok(resource.formats.length >= 3, `${resource.id}: missing formats`);
    assert.ok(resource.caution.length >= 30, `${resource.id}: missing interpretation caution`);
    const url = new URL(resource.url);
    assert.equal(url.protocol, "https:", `${resource.id}: URL must use HTTPS`);
  }
});

test("the directory includes the core official source types", () => {
  const ids = new Set(officialResources.map((resource) => resource.id));
  [
    "kosis",
    "ecos",
    "dart",
    "kigam-map",
    "world-bank",
    "imf-data",
    "un-wpp",
    "un-comtrade",
    "usgs-mineral-data",
    "usgs-commodity"
  ].forEach((id) => assert.ok(ids.has(id), `missing core source: ${id}`));
});
