import { useEffect, useRef } from 'react';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  Entity,
  LabelStyle,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  type Viewer,
} from 'cesium';
import type { Marker } from '../types/geo';

export interface MarkerEntitiesProps {
  viewer: Viewer | null;
  markers: Marker[];
  selectedMarkerId: string | null;
  /** Selecting a marker by clicking it directly on the globe. */
  onSelectMarker(id: string): void;
  /** Clicking empty globe surface: adds a new marker there. */
  onAddMarker(lat: number, lon: number): void;
}

const DEFAULT_COLOR = Color.fromCssColorString('#ff5a5f');
const SELECTED_COLOR = Color.fromCssColorString('#3ba7ff');

function markerSignature(marker: Marker, isSelected: boolean): string {
  return `${marker.name}|${marker.lat}|${marker.lon}|${isSelected}`;
}

/**
 * Non-visual component that keeps Cesium entities in sync with the
 * `markers` array (diffed, not stored in React state) and wires up
 * click-to-add / click-to-select on the globe via a `ScreenSpaceEventHandler`.
 */
export function MarkerEntities({
  viewer,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onAddMarker,
}: MarkerEntitiesProps): null {
  const entitiesRef = useRef<Map<string, Entity>>(new Map());
  const signaturesRef = useRef<Map<string, string>>(new Map());

  // Sync entities with the markers array.
  useEffect(() => {
    if (!viewer) {
      return;
    }
    const entities = entitiesRef.current;
    const signatures = signaturesRef.current;
    const currentIds = new Set(markers.map((marker) => marker.id));

    for (const [id, entity] of entities) {
      if (!currentIds.has(id)) {
        viewer.entities.remove(entity);
        entities.delete(id);
        signatures.delete(id);
      }
    }

    for (const marker of markers) {
      const isSelected = marker.id === selectedMarkerId;
      const signature = markerSignature(marker, isSelected);
      if (signatures.get(marker.id) === signature) {
        continue;
      }

      const existing = entities.get(marker.id);
      if (existing) {
        viewer.entities.remove(existing);
      }

      const entity = viewer.entities.add({
        id: marker.id,
        name: marker.name,
        position: Cartesian3.fromDegrees(marker.lon, marker.lat),
        point: {
          pixelSize: isSelected ? 14 : 10,
          color: isSelected ? SELECTED_COLOR : DEFAULT_COLOR,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: marker.name || 'Marker',
          font: '13px sans-serif',
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -14),
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Color.fromAlpha(Color.BLACK, 0.55),
        },
      });
      entities.set(marker.id, entity);
      signatures.set(marker.id, signature);
    }
  }, [viewer, markers, selectedMarkerId]);

  // Remove all entities when the viewer itself goes away/unmounts.
  useEffect(() => {
    const entities = entitiesRef.current;
    const signatures = signaturesRef.current;
    return () => {
      if (!viewer) {
        return;
      }
      for (const entity of entities.values()) {
        viewer.entities.remove(entity);
      }
      entities.clear();
      signatures.clear();
    };
  }, [viewer]);

  // Click-to-select / click-to-add. Callbacks are read via refs so the
  // handler itself only needs to be (re)created when the viewer changes.
  const onSelectMarkerRef = useRef(onSelectMarker);
  onSelectMarkerRef.current = onSelectMarker;
  const onAddMarkerRef = useRef(onAddMarker);
  onAddMarkerRef.current = onAddMarker;

  useEffect(() => {
    if (!viewer) {
      return;
    }

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked: { id?: unknown } | undefined = viewer.scene.pick(event.position);
      if (picked && picked.id instanceof Entity && entitiesRef.current.has(picked.id.id)) {
        onSelectMarkerRef.current(picked.id.id);
        return;
      }

      const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
      if (!cartesian) {
        return;
      }
      const carto = Cartographic.fromCartesian(cartesian);
      onAddMarkerRef.current(CesiumMath.toDegrees(carto.latitude), CesiumMath.toDegrees(carto.longitude));
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [viewer]);

  return null;
}
