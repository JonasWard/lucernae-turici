import React from 'react';
import { DataType } from '../../../../urlAsState/enums/dataTypes';
import { DataEntry } from '../../../../urlAsState/types/dataEntry';
import { FloatDataEntryRenderer } from './FloatDataEntryRenderer';
import { IntDataEntryRenderer } from './IntDataEntryRenderer';
import { VersionDataEntryRenderer } from './VersionDataEntryRenderer';
import { VersionEnumSemantics } from '../../../../urlAsState/types/versionParser';
import { BooleanDataEntryRenderer } from './BooleanDataEntryRenderer';
import { EnumDataEntryRenderer } from './EnumDataEntryRenderer';

export interface IDatyEntryRendererProps {
  dataEntry: DataEntry;
  updateEntry: (newValue: DataEntry) => void;
  versionEnumSemantics?: VersionEnumSemantics;
  asSlider?: boolean;
}

export const DataEntryRenderer: React.FC<IDatyEntryRendererProps> = ({ asSlider, dataEntry, updateEntry, versionEnumSemantics }) => {
  switch (dataEntry.type) {
    case DataType.INT:
      return <IntDataEntryRenderer asSlider={asSlider} int={dataEntry} onChange={updateEntry} />;
    case DataType.FLOAT:
      return <FloatDataEntryRenderer asSlider={asSlider} float={dataEntry} onChange={updateEntry} />;
    case DataType.VERSION:
      return <VersionDataEntryRenderer version={dataEntry} onChange={updateEntry} versionEnumSemantics={versionEnumSemantics} />;
    case DataType.BOOLEAN:
      return <BooleanDataEntryRenderer bool={dataEntry} onChange={updateEntry} />;
    case DataType.ENUM:
      return <EnumDataEntryRenderer enumValue={dataEntry} onChange={updateEntry} versionEnumSemantics={versionEnumSemantics} />;
    default:
      return null;
  }
};
