import * as React from "react";
import * as Constants from "~/common/constants";
import * as SVG from "~/common/svg";
import * as Strings from "~/common/strings";
import * as Actions from "~/common/actions";
import * as Events from "~/common/custom-events";

import { css } from "@emotion/react";
import { Alert } from "~/components/core/Alert";

import CarouselSidebar from "~/components/core/CarouselSidebar";
import SlateMediaObject from "~/components/core/SlateMediaObject";

const STYLES_ROOT = css`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${Constants.system.white};
  z-index: ${Constants.zindex.modal};
  background-color: rgba(0, 0, 0, 0.8);

  ${
    "" /* Note(Amine): we're using the blur filter to fix a weird backdrop-filter's bug in chrome */
  }
  filter: blur(0px);
  @supports ((-webkit-backdrop-filter: blur(15px)) or (backdrop-filter: blur(15px))) {
    -webkit-backdrop-filter: blur(15px);
    backdrop-filter: blur(15px);
  }

  @keyframes global-carousel-fade-in {
    from {
      transform: translate(8px);
      opacity: 0;
    }
    to {
      transform: trannslateX(0px);
      opacity: 1;
    }
  }
  animation: global-carousel-fade-in 400ms ease;
`;

const STYLES_ROOT_CONTENT = css`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const STYLES_BOX = css`
  user-select: none;
  height: 32px;
  width: 32px;
  border-radius: 32px;
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: ${Constants.zindex.modal};
  background: ${Constants.system.pitchBlack};
  color: ${Constants.system.white};
  cursor: pointer;
  margin: auto;

  :hover {
    background-color: ${Constants.system.black};
  }
`;

const STYLES_EXPANDER = css`
  color: ${Constants.system.darkGray};
  position: absolute;
  padding: 4px;
  top: 16px;
  left: 16px;
  cursor: pointer;

  :hover {
    color: ${Constants.system.white};
  }
`;

const STYLES_DISMISS_BOX = css`
  position: absolute;
  top: 16px;
  right: 16px;
  color: ${Constants.system.darkGray};
  cursor: pointer;

  :hover {
    color: ${Constants.system.white};
  }
`;

const STYLES_MOBILE_ONLY = css`
  @media (min-width: ${Constants.sizes.mobile}px) {
    display: none;
  }
`;

const STYLES_MOBILE_HIDDEN = css`
  @media (max-width: ${Constants.sizes.mobile}px) {
    display: none;
  }
`;

export class GlobalCarousel extends React.Component {
  state = {
    showSidebar: true,
  };

  componentDidMount = () => {
    window.addEventListener("keydown", this._handleKeyDown);
    // window.addEventListener("slate-global-open-carousel", this._handleOpen);
    // window.addEventListener("slate-global-close-carousel", this._handleClose);
  };

  componentWillUnmount = () => {
    window.removeEventListener("keydown", this._handleKeyDown);
    // window.removeEventListener("slate-global-open-carousel", this._handleOpen);
    // window.removeEventListener("slate-global-close-carousel", this._handleClose);
  };

  findSelectedIndex = () => {
    const cid = this.props.params?.cid;
    if (!cid) {
      return -1;
    }
    let index = this.props.objects.findIndex((elem) => elem.cid === cid);
    return index;
  };

  _handleKeyDown = (e) => {
    const inputs = document.querySelectorAll("input");
    for (let elem of inputs) {
      if (document.activeElement === elem) {
        return;
      }
    }

    const textareas = document.querySelectorAll("textarea");
    for (let elem of textareas) {
      if (document.activeElement === elem) {
        return;
      }
    }

    switch (e.key) {
      case "Escape":
        this._handleClose();
        break;
      case "Right":
      case "ArrowRight":
        this._handleNext();
        break;
      case "Left":
      case "ArrowLeft":
        this._handlePrevious();
        break;
    }
  };

  // setWindowState = (data = {}) => {
  //   const cid = data?.cid;
  //   if (this.props.carouselType === "ACTIVITY") {
  //     window.history.replaceState(
  //       { ...window.history.state, cid: cid },
  //       null,
  //       cid ? `/${data.owner}/${data.slate.slatename}/cid:${cid}` : `/_?scene=NAV_ACTIVITY`
  //     );
  //     return;
  //   }

  //   let baseURL = window.location.pathname.split("/");
  //   if (this.props.carouselType === "SLATE") {
  //     baseURL.length = 3;
  //   } else if (this.props.carouselType === "PROFILE") {
  //     baseURL.length = 2;
  //   } else if (this.props.carouselType === "DATA") {
  //     baseURL.length = 2;
  //     if (cid) {
  //       baseURL[1] = this.props.viewer.username;
  //     } else {
  //       baseURL[1] = "_?scene=NAV_DATA";
  //     }
  //   }
  //   baseURL = baseURL.join("/");

  //   window.history.replaceState(
  //     { ...window.history.state, cid: cid },
  //     null,
  //     cid ? `${baseURL}/cid:${cid}` : baseURL
  //   );
  // };

  // _handleOpen = (e) => {
  //   let index = e.detail.index;
  //   const objects = this.props.objects;
  //   if (e.detail.index === null) {
  //     if (e.detail.id !== null) {
  //       index = objects.findIndex((obj) => obj.id === e.detail.id);
  //     }
  //   }
  //   if (index === null || index < 0 || index >= objects.length) {
  //     return;
  //   }
  //   this.setState({
  //     visible: true,
  //     index: e.detail.index,
  //   });
  //   const data = objects[e.detail.index];
  //   this.setWindowState(data);
  // };

  _handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (this.props.onChange) {
      this.props.onChange(-1);
    } else {
      let params = { ...this.props.params };
      delete params.cid;
      this.props.onAction({
        type: "UPDATE_PARAMS",
        params,
        redirect: true,
      });
    }

    // this.setState({ visible: false, index: 0 });
    // this.setWindowState();
  };

  _handleNext = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (this.props.onChange) {
      let index = this.props.index + 1;
      if (index >= this.props.objects.length) return;
      this.props.onChange(index);
    } else {
      let index = this.findSelectedIndex() + 1;
      if (index >= this.props.objects.length) {
        return;
      }
      let cid = this.props.objects[index].cid;
      // this.setState({ index });
      this.props.onAction({
        type: "UPDATE_PARAMS",
        params: { ...this.props.params, cid },
        redirect: true,
      });
    }
    // const data = this.props.objects[index];
    // this.setWindowState(data);
  };

  //it uses the initial cid to set which index it is, then it goes off its internal index from there and sets apge still but doesn't get from it?
  //though that
  //maybe the initial open is triggered by page, combined with index?
  //or mayube

  _handlePrevious = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (this.props.onChange) {
      let index = this.props.index - 1;
      if (index < 0) return;
      this.props.onChange(index);
    } else {
      let index = this.findSelectedIndex() - 1;
      if (index < 0) {
        return;
      }
      let cid = this.props.objects[index].cid;
      // this.setState({ index });
      this.props.onAction({
        type: "UPDATE_PARAMS",
        params: { ...this.props.params, cid },
        redirect: true,
      });
    }
    // const data = this.props.objects[index];
    // this.setWindowState(data);
  };

  _handleToggleSidebar = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ showSidebar: !this.state.showSidebar });
  };

  render() {
    let index;
    if (this.props.onChange) {
      index = this.props.index;
    } else {
      index = this.findSelectedIndex();
    }
    if (!this.props.carouselType || index < 0 || index >= this.props.objects.length) {
      return null;
    }
    let file = this.props.objects[index];
    if (!file) {
      return null;
    }

    let { isMobile } = this.props;

    let isRepost = false;
    if (this.props.carouselType === "SLATE") {
      isRepost = this.props.data?.ownerId !== file.ownerId;
    }

    let slide = <SlateMediaObject file={file} isMobile={isMobile} />;

    return (
      <div css={STYLES_ROOT}>
        <Alert
          viewer={this.props.viewer}
          noWarning
          id={isMobile ? "slate-mobile-alert" : null}
          style={
            isMobile
              ? null
              : {
                  bottom: 0,
                  top: "auto",
                  paddingRight: this.props.sidebar
                    ? `calc(${Constants.sizes.sidebar}px + 48px)`
                    : "auto",
                }
          }
        />
        <div css={STYLES_ROOT_CONTENT} style={this.props.style} onClick={this._handleClose}>
          {index > 0 && (
            <span
              css={STYLES_BOX}
              onClick={this._handlePrevious}
              style={{ top: 0, left: 16, bottom: 0 }}
            >
              <SVG.ChevronLeft height="20px" />
            </span>
          )}
          {index < this.props.objects.length - 1 && (
            <span
              css={STYLES_BOX}
              onClick={this._handleNext}
              style={{ top: 0, right: 16, bottom: 0 }}
            >
              <SVG.ChevronRight height="20px" />
            </span>
          )}
          {slide}
          <span css={STYLES_MOBILE_ONLY}>
            <div css={STYLES_DISMISS_BOX} onClick={this._handleClose}>
              <SVG.Dismiss height="24px" />
            </div>
          </span>
          <span css={STYLES_MOBILE_HIDDEN}>
            {this.state.showSidebar ? (
              <div css={STYLES_EXPANDER} onClick={this._handleToggleSidebar}>
                <SVG.Maximize height="24px" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div css={STYLES_EXPANDER} onClick={this._handleToggleSidebar}>
                  <SVG.Minimize height="24px" />
                </div>
                <div css={STYLES_DISMISS_BOX} onClick={this._handleClose}>
                  <SVG.Dismiss height="24px" />
                </div>
              </div>
            )}
          </span>
        </div>
        <span css={STYLES_MOBILE_HIDDEN}>
          <CarouselSidebar
            key={file.id}
            {...this.props}
            file={file}
            display={this.state.showSidebar ? "block" : "none"}
            onClose={this._handleClose}
            isRepost={isRepost}
            onAction={this.props.onAction}
          />
        </span>
      </div>
    );
  }
}
