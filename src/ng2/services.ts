import {Injectable} from "angular2/core";
import {PlatformLocation, LocationStrategy, PathLocationStrategy} from "angular2/router";
import {services} from "../common/coreservices";
import {isDefined} from "../common/predicates";

@Injectable()
export class UiLocationStrategy {
  private hashPrefix: string = '!';

  constructor(private locationStrategy: LocationStrategy, private _platformLocation: PlatformLocation) {
  }
  
  init() {
    let loc = <any> services.location;

    loc.hash = () => this._platformLocation.hash;
    loc.path = this.locationStrategy.path;
    loc.search = () => location.search;
    loc.url = (url) => {
      if(url) {
        location.hash = url;
      }
      return loc.path();
    };
    loc.replace = this.locationStrategy.replaceState;
    // should we use location.onPopState instead ? https://github.com/angular/angular/blob/d272f96e23f379e1b565435b3af010138e710ab9/modules/angular2/src/router/location/hash_location_strategy.ts#L61
    loc.onChange = this._platformLocation.onHashChange;

    let locCfg = <any> services.locationConfig;

    locCfg.port = () => location.port;
    locCfg.protocol = () => location.protocol;
    locCfg.host = () => location.host;
    locCfg.baseHref = this.locationStrategy.getBaseHref;
    locCfg.html5Mode = () => this.locationStrategy instanceof PathLocationStrategy; // does it work ?
    locCfg.hashPrefix = (newprefix: string): string => {
      if(isDefined(newprefix)) {
        this.hashPrefix = newprefix;
      }
      return this.hashPrefix;
    };
  }
}
