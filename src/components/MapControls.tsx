import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Match the original site: coordinate readout shows raw map X/Y without wrapping.
const AnyL = L as any;
AnyL.Control.Coordinates.include({
  _update(this: any, evt: any) {
    const pos = evt.latlng;
    const opts = this.options;
    if (pos) {
      this._currentPos = pos;
      this._inputY.value = AnyL.NumberFormatter.round(pos.lat, opts.decimals, opts.decimalSeperator);
      this._inputX.value = AnyL.NumberFormatter.round(pos.lng, opts.decimals, opts.decimalSeperator);
      this._label.innerHTML = this._createCoordinateLabel(pos);
    }
  },
});

export default function MapControls() {
  const map = useMap();

  useEffect(() => {
    const zoom = new L.Control.Zoom({ position: 'topright' });
    map.addControl(zoom);

    const fullscreen = AnyL.control.fullscreen({ position: 'topright' });
    map.addControl(fullscreen);

    const coordinates = AnyL.control.coordinates({
      position: 'bottomright',
      decimals: 0,
      decimalSeperator: '.',
      labelTemplateLat: 'Y: {y}',
      labelTemplateLng: 'X: {x}',
      enableUserInput: true,
      useDMS: false,
      useLatLngOrder: false,
    });
    map.addControl(coordinates);

    const hash = AnyL.hash(map);

    return () => {
      map.removeControl(zoom);
      map.removeControl(fullscreen);
      map.removeControl(coordinates);
      if (hash && typeof hash.removeFrom === 'function') hash.removeFrom();
    };
  }, [map]);

  return null;
}
