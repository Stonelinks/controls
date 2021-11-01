import { now } from "moment";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { nothing } from "../common/nothing";
import { MILLISECONDS_IN_SECOND } from "../common/time";
import { Db } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import Debug from "../utils/debug";

const mapState = (state: RootState) => ({
  db: state.api.getDb.value as Db | typeof nothing,
});

const mapDispatch = {
  onGetDb: () => apiCall("getDb"),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = PropsFromRedux & OwnProps;

const DbViewer = ({ db, onGetDb }: Props) => {
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    interval = setInterval(() => {
      onGetDb();
    }, MILLISECONDS_IN_SECOND);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onGetDb]);

  React.useEffect(() => {
    onGetDb();
  }, [onGetDb]);

  if (db === nothing) {
    return null;
  }

  return (
    <div>
      <Debug d={db} />
    </div>
  );
};

export default connector(DbViewer);
