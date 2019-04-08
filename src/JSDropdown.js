import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  Modal
} from "react-native";
import PropTypes from "prop-types";

const colors = {
  WHITE: "#fff",
  LIGHT_GREY: "#f9f9f9",
  DARKER_LIGHT_GREY: "#f2f2f2",
  GREY: "#e3e3e3"
};

/**
 * A dropdown component written in pure JS for Android and iOS
 */
class JSDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      index: 0,
      dropdownButtonProps: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    };
  }

  static propTypes = {
    dropdownContainerStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array
    ]),
    textStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array
    ]),
    buttonStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array
    ]),
    dropdownItemStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array
    ]),
    caretContainerStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array
    ]),

    buttonHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    dropdownItemHeight: PropTypes.number,
    caretOpenComponent: PropTypes.object,
    caretCloseComponent: PropTypes.object,

    entries: PropTypes.array.isRequired,
    index: PropTypes.number,

    disabled: PropTypes.bool,

    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    onOpen: PropTypes.func
  };

  static defaultProps = {
    buttonHeight: 50,
    width: "100%",
    index: 0,
    dropdownItemHeight: 50,
    disabled: false,
    onChange: () => {},
    onClose: () => {},
    onOpen: () => {}
  };

  componentWillUnmount() {
    this.close();
  }

  close = () => {
    this.setState({ open: false });
  };

  open = () => {
    this.setState({ open: true });
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  onChange = (i, item) => {
    this.props.onChange(i, item);
    this.close();
  };

  onDropdownButtonLayout = event => {
    this._button.measure((fx, fy, width, height, px, py) => {
      const dropdownButtonProps = {
        x: px,
        y: py,
        width: width,
        height: height
      };
      this.setState({ dropdownButtonProps });
    });
  };

  getDropdownTopOffset = () => {
    const { y, height } = this.state.dropdownButtonProps;
    const { inverted } = this.props;
    if (inverted) {
      return y + this.calculateListHeight() * -1;
    } else {
      return height + y;
    }
  };

  getItemValue = i => {
    return i && (i.thumbnail || i.value) ? i.value : i;
  };

  getItemThumbnail = i => {
    return i && i.thumbnail ? (
      <View style={styles.thumbnail}>{i.thumbnail}</View>
    ) : null;
  };

  changeIndex = i => {
    this.setState({ index: i });
  };

  calculateListHeight = () => {
    const { entries, dropdownItemHeight } = this.props;
    if (entries.length > 4) {
      return dropdownItemHeight * 4;
    } else {
      return entries.length * dropdownItemHeight;
    }
  };

  _renderList = () => {
    const {
      entries,
      inverted,
      dropdownItemHeight,
      dropdownItemStyle,
      textStyle,
      dropdownContainerStyle
    } = this.props;
    return (
      <FlatList
        style={[
          styles.dropdownList,
          {
            top: this.getDropdownTopOffset(),
            height: this.calculateListHeight()
          },
          dropdownContainerStyle
        ]}
        data={entries}
        extraData={entries}
        inverted={inverted}
        scrollEnabled
        nestedScrollEnabled
        renderItem={i => (
          <TouchableOpacity onPress={() => this.onChange(i.index, i.item)}>
            <View
              key={i.index}
              style={[
                styles.dropdownItem,
                {
                  width: this.state.dropdownButtonProps.width,
                  height: dropdownItemHeight
                },
                dropdownItemStyle
              ]}
            >
              {this.getItemThumbnail(i.item)}
              <Text style={textStyle}>{this.getItemValue(i.item)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };
  _renderDropdown = () => {
    const { open } = this.state;
    const { disabled } = this.props;
    if (open && !disabled) {
      return (
        <Modal
          animationType={"fade"}
          visible={true}
          transparent={true}
          onRequestClose={this.close}
          supportedOrientations={[
            "portrait",
            "portrait-upside-valueown",
            "landscape",
            "landscape-left",
            "landscape-right"
          ]}
        >
          <TouchableWithoutFeedback disabled={!open} onPress={this.close}>
            <View style={styles.modal}>{this._renderList()}</View>
          </TouchableWithoutFeedback>
        </Modal>
      );
    }
    return null;
  };

  _renderCaret = () => {
    const {
      caretOpenComponent,
      caretCloseComponent,
      buttonHeight,
      caretContainerStyle,
      entries
    } = this.props;
    const { open } = this.state;
    if (entries.length > 1 && (caretOpenComponent || caretCloseComponent)) {
      let component = null;
      if (open) {
        component = caretCloseComponent
          ? caretCloseComponent
          : caretOpenComponent;
      } else {
        component = caretOpenComponent
          ? caretOpenComponent
          : caretCloseComponent;
      }
      return (
        <View
          style={[
            { width: buttonHeight, height: buttonHeight },
            styles.caretContainer,
            caretContainerStyle
          ]}
        >
          {component}
        </View>
      );
    }
    return null;
  };

  _renderButton = () => {
    const {
      width,
      buttonHeight,
      buttonStyle,
      entries,
      textStyle,
      index,
      disabled,
      buttonContainerStyle
    } = this.props;
    return (
      <View style={[styles.buttonContainerStyle, buttonContainerStyle]}>
        <TouchableOpacity
          ref={button => (this._button = button)}
          onPress={this.toggle}
          disabled={disabled || entries.length <= 1}
        >
          <View
            style={[
              styles.buttonContainer,
              {
                width: width,
                height: buttonHeight
              },
              buttonStyle
            ]}
            onLayout={this.onDropdownButtonLayout}
          >
            {this.getItemThumbnail(entries[index])}
            <Text style={[textStyle]}>{this.getItemValue(entries[index])}</Text>
            {this._renderCaret()}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <View>
        {this._renderButton()}
        {this._renderDropdown()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  caretContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonContainerStyle: {
    backgroundColor: colors.LIGHT_GREY
  },
  container: {
    width: "100%",
    height: "100%"
  },
  buttonContainer: {
    backgroundColor: colors.LIGHT_GREY,
    borderColor: colors.GREY,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  dropdownList: {
    position: "absolute",
    backgroundColor: colors.DARKER_LIGHT_GREY
  },
  dropdownItem: {
    backgroundColor: colors.DARKER_LIGHT_GREY,
    borderBottomColor: colors.GREY,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  thumbnail: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    flexGrow: 1
  }
});

export default JSDropdown;
