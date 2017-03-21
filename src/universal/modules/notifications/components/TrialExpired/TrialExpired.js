import React, {PropTypes} from 'react';
import {withRouter} from 'react-router';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import Row from 'universal/components/Row/Row';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {segmentEventTrack} from 'universal/redux/segmentActions';

const TrialExpired = (props) => {
  const {dispatch, orgId, router, styles} = props;
  const addBilling = () => {
    dispatch(
      segmentEventTrack('Notification TrialExpired Click')
    );
    router.push(`/me/organizations/${orgId}`);
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="credit-card" />
          </div>
        </div>
      </div>
      <div className={css(styles.message)}>
        Your trial has expired!
        Keep your team going by heading to the Organizastion Settings page.
      </div>
      <div className={css(styles.buttonGroup)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Take me there"
          size={ui.notificationButtonSize}
          type="submit"
          onClick={addBilling}
        />
      </div>
    </Row>
  );
};

TrialExpired.propTypes = {
  dispatch: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
  styles: PropTypes.string
};

const avatarPlaceholderSize = '2.75rem';
const styleThunk = () => ({
  ...defaultStyles,
  avatarPlaceholder: {
    backgroundColor: appTheme.palette.mid50l,
    borderRadius: '100%',
    // boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${appTheme.palette.mid10a}`,
    color: appTheme.palette.mid50l,
    fontSize: ui.iconSizeAvatar,
    height: avatarPlaceholderSize,
    lineHeight: avatarPlaceholderSize,
    padding: '1px',
    position: 'relative',
    textAlign: 'center',
    width: avatarPlaceholderSize,

    ':after': {
      border: '2px solid currentColor',
      borderRadius: '100%',
      content: '""',
      display: 'block',
      height: avatarPlaceholderSize,
      left: 0,
      position: 'absolute',
      top: 0,
      width: avatarPlaceholderSize
    }
  },

  avatarPlaceholderInner: {
    backgroundColor: '#fff',
    borderRadius: '100%',
    height: '2.625rem',
    // lineHeight: '2.625rem',
    overflow: 'hidden',
    width: '2.625rem'
  }
});

export default withRouter(
  withStyles(styleThunk)(TrialExpired)
);
