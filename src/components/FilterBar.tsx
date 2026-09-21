"use client";
import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { REGIONS } from "@/types";
import { getDynamicRegions } from "@/lib/regionUtils";
import { PLACE_TYPE_COLORS, placeLabel, type PlaceTypeFilter } from "@/lib/placeTypes";
import type { Region, Workshop } from "@/types";
import {
  ChevronDown,
  Search,
  Map,
  List,
  LocateFixed,
  Loader2,
  X,
} from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import styles from "./FilterBar.module.css";

// The "Near Me" button is hidden for now. Flip to true to bring it back.
const SHOW_NEARBY_BUTTON = false;

interface FilterBarProps {
  workshops?: Workshop[];
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  query: string;
  onQueryChange: (query: string) => void;
  typeFilter?: PlaceTypeFilter;
  onTypeChange?: (type: PlaceTypeFilter) => void;
  counts?: { workshop: number; event: number };
  viewMode?: "map" | "list";
  onViewModeChange?: (mode: "map" | "list") => void;
}

export default function FilterBar({
  workshops = [],
  selectedRegion,
  onRegionChange,
  query,
  onQueryChange,
  typeFilter = "all",
  onTypeChange = () => {},
  counts = { workshop: 0, event: 0 },
  viewMode = "map",
  onViewModeChange = () => {},
}: FilterBarProps) {
  const { locale } = useLanguage();
  const [regionOpen, setRegionOpen] = useState(false);
  // What is typed stays a draft; the list only changes when the search is submitted
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setDraft(query);
  }
  const barRef = useRef<HTMLDivElement>(null);
  const { userLocation, locationStatus, requestNearbySort, clearNearbySort } =
    useFilter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dynamicRegions = React.useMemo(
    () => getDynamicRegions(workshops, [], locale),
    [workshops, locale],
  );
  const selectedRegionData = React.useMemo(
    () =>
      dynamicRegions.find((r) => r.key === selectedRegion) ||
      dynamicRegions[0] ||
      REGIONS[0],
    [dynamicRegions, selectedRegion],
  );

  const searchPlaceholder =
    locale === "ko" ? "종목·언어 검색 (예: 도자기, 영어)" : "Search craft or language";
  const searchLabel = locale === "ko" ? "검색" : "Search";

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onQueryChange(draft.trim());
  };

  const clearSearch = () => {
    setDraft("");
    onQueryChange("");
  };

  const typeTabs: { key: PlaceTypeFilter; label: string; count?: number; dot?: string }[] = [
    { key: "all", label: placeLabel("all", locale), count: counts.workshop + counts.event },
    { key: "workshop", label: placeLabel("workshop", locale), count: counts.workshop, dot: PLACE_TYPE_COLORS.workshop.fg },
    { key: "event", label: placeLabel("event", locale), count: counts.event, dot: PLACE_TYPE_COLORS.event.fg },
  ];

  return (
    <div
      className={styles.filterBar}
      id="filter-bar"
      ref={barRef}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-4)",
        overflow: "visible",
        alignItems: "center",
      }}
    >
      {/* 1. Region Dropdown */}
      <div style={{ position: "relative" }}>
        <button
          className={styles.chip}
          onClick={() => setRegionOpen((prev) => !prev)}
          style={{
            background: regionOpen
              ? "var(--color-bg-secondary)"
              : "var(--color-surface)",
          }}
        >
          {selectedRegionData.emoji}{" "}
          <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {regionOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              background: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
              minWidth: "160px",
              display: "flex",
              flexDirection: "column",
              padding: "var(--space-2)",
            }}
          >
            {dynamicRegions.map((region) => (
              <button
                key={region.key}
                disabled={!region.available}
                onClick={() => {
                  if (region.available) {
                    onRegionChange(region.key);
                    setRegionOpen(false);
                  }
                }}
                style={{
                  textAlign: "left",
                  padding: "var(--space-2)",
                  background:
                    selectedRegion === region.key
                      ? "var(--color-bg-secondary)"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: region.available ? "pointer" : "not-allowed",
                  opacity: region.available ? 1 : 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {region.emoji} {region.label[locale]}
                </span>
                {region.count > 0 && region.key !== "all" && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      marginLeft: 8,
                    }}
                  >
                    {region.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Category + Language text search */}
      <form className={styles.searchBox} onSubmit={submitSearch} role="search">
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        {(draft || query) && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={clearSearch}
            aria-label={locale === "ko" ? "검색어 지우기" : "Clear search"}
          >
            <X size={14} />
          </button>
        )}
        <button type="submit" className={styles.searchSubmit} aria-label={searchLabel} title={searchLabel}>
          <Search size={14} />
        </button>
      </form>

      {/* Studios only / festivals only / both */}
      <div className={styles.typeTabs} role="tablist" aria-label={locale === "ko" ? "보기 유형" : "Show"}>
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={typeFilter === tab.key}
            className={`${styles.typeTab} ${typeFilter === tab.key ? styles.typeTabActive : ""}`}
            onClick={() => onTypeChange(tab.key)}
          >
            {tab.dot && <span className={styles.typeDot} style={{ background: tab.dot }} />}
            {tab.label}
            <span className={styles.typeCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Nearby Sort Toggle (hidden, see SHOW_NEARBY_BUTTON) */}
      {SHOW_NEARBY_BUTTON && (
        <button
          className={styles.chip}
          onClick={() =>
            userLocation ? clearNearbySort() : requestNearbySort()
          }
          disabled={locationStatus === "loading"}
          title={
            locationStatus === "denied"
              ? locale === "ko"
                ? "위치 접근이 거부되었습니다"
                : "Location access denied"
              : undefined
          }
          style={{
            background: userLocation
              ? "var(--color-accent)"
              : "var(--color-surface)",
            color: userLocation ? "#ffffff" : "var(--color-text-secondary)",
            borderColor: userLocation ? "var(--color-accent)" : undefined,
          }}
        >
          {locationStatus === "loading" ? (
            <Loader2 size={14} className={styles.spin} />
          ) : (
            <LocateFixed size={14} />
          )}
          <span className={styles.nearbyLabel}>
            {locale === "ko" ? "내 주변" : "Near Me"}
          </span>
        </button>
      )}

      {/* View Mode Toggle */}
      <div className={styles.viewModeToggle}>
        <button
          onClick={() => onViewModeChange?.("list")}
          style={{
            padding: "6px 12px",
            border:
              viewMode === "list"
                ? "1px solid var(--color-text-primary)"
                : "1px solid var(--color-border)",
            borderRadius: "var(--radius-full)",
            background:
              viewMode === "list" ? "var(--color-text-primary)" : "transparent",
            boxShadow:
              viewMode === "list" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none",
            color:
              viewMode === "list" ? "#ffffff" : "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          aria-label="List View"
        >
          <List size={18} strokeWidth={viewMode === "list" ? 2.5 : 2} />
        </button>
        <button
          onClick={() => onViewModeChange?.("map")}
          style={{
            padding: "6px 12px",
            border:
              viewMode === "map"
                ? "1px solid var(--color-text-primary)"
                : "1px solid var(--color-border)",
            borderRadius: "var(--radius-full)",
            background:
              viewMode === "map" ? "var(--color-text-primary)" : "transparent",
            boxShadow:
              viewMode === "map" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none",
            color:
              viewMode === "map" ? "#ffffff" : "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          aria-label="Map View"
        >
          <Map size={18} strokeWidth={viewMode === "map" ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
}
