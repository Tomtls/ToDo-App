export type CreateLabelDto = {
  name: string;
};

export type UpdateLabelDto = {
  name?: string;
};

export type AttachLabelDto = {
  label_id: string;
};
