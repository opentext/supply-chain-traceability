/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { IoMdCloseCircle, IoMdClose } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { FaFile } from 'react-icons/fa';
import { TbCircleCheckFilled, TbInfoTriangleFilled } from 'react-icons/tb';
import { classNames, getEllipses } from '../../../utilities/Utils';
import './CustomToast.css';

const ToastTypes = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
};

const FILE_NAME_CLIP_COUNT = 38;
const FILE_ERROR_CLIP_COUNT = 48;

function Toast({
  autoDismiss,
  children,
  details,
  isOpen,
  onClose,
  type,
  isCloseable,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const activeClassName = classNames(
    'ewsm-message ewsm-message--is-header-bar',
    {
      'ewsm-message--is-active': isOpen,
    },
  );
  const typeClassName = classNames('ewsm-message__container', {
    'ewsm-message--has-success': type === ToastTypes.SUCCESS,
    'ewsm-message--has-error': type === ToastTypes.ERROR,
    'ewsm-message--has-info': type === ToastTypes.INFO,
    'ewsm-message--has-warning': type === ToastTypes.WARNING,
  });
  const detailsIconClassName = classNames('ewsm-message__details-icon', {
    'ewsm-message--is-expand': showDetails,
    'ewsm-message--is-collapse': !showDetails,
  });
  const detailsClassName = classNames('ewsm-message__details', {
    'ewsm-message--is-active': showDetails,
  });
  const toggleDetails = () => setShowDetails(!showDetails);

  useEffect(() => {
    let timeout = null;
    if (timeout) clearTimeout(timeout);

    if (isOpen && autoDismiss) {
      timeout = setTimeout(onClose, autoDismiss);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen, autoDismiss, onClose]);

  // TODO: This needs improvement as we are handling only file errors
  const detailsMessage = (() => Object.entries(details).map(([key, value]) => (
    // const errorText = value + "";
    <div className="otrc-toast-details" key={key}>
      {type === ToastTypes.SUCCESS ? (
        <TbCircleCheckFilled style={{ color: 'green' }} />
      ) : type === ToastTypes.ERROR ? (
        <IoMdCloseCircle />
      ) : type === ToastTypes.INFO ? (
        <IoInformationCircleOutline />
      ) : type === ToastTypes.WARNING ? (
        <TbInfoTriangleFilled />
      ) : (
        <FaFile />
      )}
      <div className="otrc-toast-details-content">
        {type !== ToastTypes.SUCCESS && (
        <>
          <div
            className="otrc-toast-details--is-file-name"
            {...(key.length > FILE_NAME_CLIP_COUNT ? { title: key } : null)}
          >
            {getEllipses(key, FILE_NAME_CLIP_COUNT)}
          </div>
          <div
            className="otrc-toast-details--is-file-error"
            {...(value.length > FILE_ERROR_CLIP_COUNT
              ? { title: value }
              : null)}
          >
            {getEllipses(value, FILE_ERROR_CLIP_COUNT)}
          </div>
        </>
        )}
        {type === ToastTypes.SUCCESS && (
        <div
          className="otrc-toast-details--is-file-success"
          {...(value.length > FILE_NAME_CLIP_COUNT
            ? { title: value }
            : null)}
        >
          {getEllipses(value, FILE_NAME_CLIP_COUNT)}
        </div>
        )}
      </div>
      {type === ToastTypes.ERROR && <IoMdClose />}
    </div>
  )))();

  const buildDetails = () => React.Children.toArray(detailsMessage).map((detail, index) => (
    <li key={index} className="ewsm-message__list-item">
      <div className="ewsm-message__list-content">{detail}</div>
    </li>
  ));

  return (
    <div className={activeClassName}>
      <div className={typeClassName}>
        <div className="ewsm-message__short">
          <i className="ewsm-message__icon" />
          <div className="ewsm-message__content">{children}</div>
          {React.Children.toArray(detailsMessage)?.length ? (
            <i className={detailsIconClassName} onClick={toggleDetails} />
          ) : null}
          {isCloseable && (
            <i className="ewsm-message__close" onClick={onClose} />
          )}
        </div>
        {React.Children.toArray(detailsMessage)?.length ? (
          <div className={detailsClassName}>
            <ul className="ewsm-message__list">{buildDetails()}</ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

Toast.defaultProps = {
  autoDismiss: 0,
  children: undefined,
  isOpen: false,
  type: ToastTypes.SUCCESS,
  details: [],
  isCloseable: true,
};

export default Toast;
