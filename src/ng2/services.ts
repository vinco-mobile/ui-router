import {DOM} from "angular2/src/platform/dom/dom_adapter";
import {Injectable} from "angular2/core";
import {services} from "../common/coreservices";
import {isDefined} from "../common/predicates";

const beforeAfterSubstr = char => str => {
  if (!str) return ["", ""];
  let idx = str.indexOf(char);
  if (idx === -1) return [str, ""];
  return [str.substr(0, idx), str.substr(idx + 1)];
};

const splitHash = beforeAfterSubstr("#");
const trimHashVal = (str) => str ? str.replace(/^#/, "") : "";


export abstract class UrlStrategy {
  abstract init();
}

@Injectable()
export class HashUrlStrategy extends UrlStrategy {
  private hashPrefix: string = '!';

  init() {
    let loc = <any> services.location;
    let location: Location = DOM.getLocation();

    loc.hash = () => splitHash(trimHashVal(location.hash))[1];
    loc.path = () => splitHash(trimHashVal(location.hash))[0];
    loc.search = () => location.search;
    loc.url = (url) => {
      if(isDefined(url)) {
        location.hash = url;
      }
      return loc.path();
    };
    loc.replace = () => { console.log(new Error('$location.replace() not impl'))};
    loc.onChange = cb => window.addEventListener("hashchange", cb, false);

    let locCfg = <any> services.locationConfig;

    locCfg.port = () => location.port;
    locCfg.protocol = () => location.protocol;
    locCfg.host = () => location.host;
    locCfg.baseHref = () => null;
    locCfg.html5Mode = () => false;
    locCfg.hashPrefix = (newprefix: string): string => {
      if(isDefined(newprefix)) {
        this.hashPrefix = newprefix;
      }
      return this.hashPrefix;
    };
  }
}


@Injectable()
export class HTML5UrlStrategy extends UrlStrategy {
  baseHref: string;

  init() {
    let loc = <any> services.location;
    let location: Location = DOM.getLocation();
    let history: History = DOM.getHistory();
    this.baseHref = DOM.getBaseHref() || "";

    loc.hash = () =>
        trimHashVal(location.hash);
    loc.path = () => {
      let path = location.pathname;
      let idx = path.indexOf(this.baseHref);
      if (idx !== 0) throw new Error(`current url: ${path} does not start with <base> tag ${this.baseHref}`);
      return path.substr(this.baseHref.length);
    };

    loc.search = () =>
        location.search;
    loc.url = (url) => {
      if(isDefined(url) && url !== loc.url()) {
        history.pushState(null, null, this.baseHref + url);
      }
      let hash = loc.hash();
      return loc.path() + (hash ? "#" + hash : "");
    };
    loc.replace = () => { console.log(new Error('$location.replace() not impl'))};
    loc.onChange = cb => window.addEventListener("popstate", cb, false);

    let locCfg = <any> services.locationConfig;

    locCfg.port = () => location.port;
    locCfg.protocol = () => location.protocol;
    locCfg.host = () => location.host;
    locCfg.baseHref = (baseHref?) => {
      if (isDefined(baseHref)) {
        this.baseHref = baseHref;
      }
      return this.baseHref
    };
    locCfg.html5Mode = () => true;
    locCfg.hashPrefix = () => null;
  }
}
