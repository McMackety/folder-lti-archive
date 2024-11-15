import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Assignment = {
  __typename?: 'Assignment';
  fid: Scalars['ID'];
  id: Scalars['ID'];
  pages?: Maybe<Array<Page>>;
  name: Scalars['String'];
};

export type Folder = {
  __typename?: 'Folder';
  fid: Scalars['ID'];
  name: Scalars['String'];
  pages?: Maybe<Array<Page>>;
};

export type FolderComponent = {
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type ListComponent = FolderComponent & {
  __typename?: 'ListComponent';
  id: Scalars['ID'];
  title: Scalars['String'];
  listItems?: Maybe<Array<ListItem>>;
};

export type ListComponentInput = {
  id: Scalars['ID'];
  listItems?: Maybe<Array<ListItemInput>>;
};

export type ListItem = {
  __typename?: 'ListItem';
  id: Scalars['ID'];
  title: Scalars['String'];
  response?: Maybe<Scalars['String']>;
};

export type ListItemInput = {
  id: Scalars['ID'];
  response: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  saveAssignment?: Maybe<Assignment>;
  pickFolderForAssignment?: Maybe<Scalars['ID']>;
  submitAssignment: Scalars['String'];
  uploadImage: Scalars['String'];
};


export type MutationSaveAssignmentArgs = {
  externalLtiID: Scalars['String'];
  data: SaveAssignmentInput;
};


export type MutationPickFolderForAssignmentArgs = {
  externalLtiID: Scalars['String'];
  folderID: Scalars['ID'];
};


export type MutationSubmitAssignmentArgs = {
  externalLtiID: Scalars['String'];
};


export type MutationUploadImageArgs = {
  base64data: Scalars['String'];
  filename: Scalars['String'];
};

export type OutlineChild = {
  __typename?: 'OutlineChild';
  id: Scalars['ID'];
  title: Scalars['String'];
  requiresResponse: Scalars['Boolean'];
  response?: Maybe<Scalars['String']>;
  children?: Maybe<Array<OutlineChild>>;
};

export type OutlineComponent = FolderComponent & {
  __typename?: 'OutlineComponent';
  id: Scalars['ID'];
  title: Scalars['String'];
  children?: Maybe<Array<OutlineChild>>;
};

export type OutlineComponentInput = {
  id: Scalars['ID'];
  responses: Array<OutlineResponse>;
};

export type OutlineResponse = {
  id: Scalars['ID'];
  response: Scalars['String'];
};

export type Page = {
  __typename?: 'Page';
  id: Scalars['ID'];
  components?: Maybe<Array<FolderComponent>>;
};

export type PictureComponent = FolderComponent & {
  __typename?: 'PictureComponent';
  id: Scalars['ID'];
  title: Scalars['String'];
  pictures?: Maybe<Array<PictureItem>>;
};

export type PictureComponentInput = {
  id: Scalars['ID'];
  pictures: Array<PictureItemInput>;
};

export type PictureItem = {
  __typename?: 'PictureItem';
  id: Scalars['ID'];
  pictureStaticUrl?: Maybe<Scalars['String']>;
  needsResponseText: Scalars['Boolean'];
  pictureResponseUrl?: Maybe<Scalars['String']>;
  textResponse?: Maybe<Scalars['String']>;
};

export type PictureItemInput = {
  id: Scalars['ID'];
  pictureResponseUrl?: Maybe<Scalars['String']>;
  textResponse?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  myAssignment?: Maybe<Assignment>;
  assignment?: Maybe<Assignment>;
  submission?: Maybe<Submission>;
  folders?: Maybe<Array<Folder>>;
  currentFolderID?: Maybe<Scalars['ID']>;
  me?: Maybe<User>;
};


export type QueryMyAssignmentArgs = {
  externalLtiID: Scalars['String'];
};


export type QueryAssignmentArgs = {
  id: Scalars['ID'];
};


export type QuerySubmissionArgs = {
  id: Scalars['ID'];
};


export type QueryCurrentFolderIdArgs = {
  externalLtiID: Scalars['String'];
};

export type SaveAssignmentInput = {
  listComponents: Array<ListComponentInput>;
  outlineComponents: Array<OutlineComponentInput>;
  pictureComponents: Array<PictureComponentInput>;
  tableComponents: Array<TableComponentInput>;
};

export type Submission = {
  __typename?: 'Submission';
  fid: Scalars['ID'];
  id: Scalars['ID'];
  pages?: Maybe<Array<Page>>;
  name: Scalars['String'];
};

export type TableCell = {
  __typename?: 'TableCell';
  row: Scalars['Int'];
  column: Scalars['Int'];
  response?: Maybe<Scalars['String']>;
};

export type TableCellInput = {
  row: Scalars['Int'];
  column: Scalars['Int'];
  response?: Maybe<Scalars['String']>;
};

export type TableComponent = FolderComponent & {
  __typename?: 'TableComponent';
  id: Scalars['ID'];
  title: Scalars['String'];
  rows: Array<Scalars['String']>;
  columns: Array<Scalars['String']>;
  cells?: Maybe<Array<TableCell>>;
};

export type TableComponentInput = {
  id: Scalars['ID'];
  cells: Array<TableCellInput>;
};

export type User = {
  __typename?: 'User';
  oid: Scalars['String'];
  name: Scalars['String'];
  role: Scalars['String'];
  email: Scalars['String'];
};
