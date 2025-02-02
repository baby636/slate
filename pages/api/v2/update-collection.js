import * as Data from "~/node_common/data";
import * as Strings from "~/common/strings";
import * as Validations from "~/common/validations";
import * as SearchManager from "~/node_common/managers/search";
import * as ViewerManager from "~/node_common/managers/viewer";

export default async (req, res) => {
  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).send({
      decorator: "NO_API_KEY_PROVIDED",
      error: true,
    });
  }

  const parsed = Strings.getKey(req.headers.authorization);

  const key = await Data.getAPIKeyByKey({
    key: parsed,
  });

  if (!key) {
    return res.status(403).send({
      decorator: "NO_MATCHING_API_KEY_FOUND",
      error: true,
    });
  }

  if (key.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_VERIFYING_API_KEY",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id: key.ownerId,
  });

  if (!user) {
    return res.status(404).send({
      decorator: "API_KEY_OWNER_NOT_FOUND",
      error: true,
    });
  }

  if (user.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_LOCATING_API_KEY_OWNER",
      error: true,
    });
  }

  if (!req.body.data) {
    return res.status(500).send({
      decorator: "V2_UPDATE_COLLECTION_MUST_PROVIDE_DATA",
      error: true,
    });
  }

  const slate = await Data.getSlateById({ id: req.body.data.id, includeFiles: true });

  if (!slate) {
    return res.status(404).send({ decorator: "COLLECTION_NOT_FOUND", error: true });
  }

  if (slate.error) {
    return res.status(500).send({ decorator: "COLLECTION_NOT_FOUND", error: true });
  }

  if (slate.ownerId !== user.id) {
    return res.status(400).send({
      decorator: "NOT_COLLECTION_OWNER_UPDATE_NOT_PERMITTED",
      error: true,
    });
  }

  //NOTE(martina): cleans the input to remove fields they should not be changing like ownerId, createdAt, etc.
  let updates = {
    id: req.body.data.id,
    updatedAt: new Date(),
    isPublic: req.body.data.isPublic,
    data: {
      name: req.body.data.data?.name,
      body: req.body.data.data?.body,
    },
  };

  if (typeof updates.isPublic !== "undefined" && slate.isPublic !== updates.isPublic) {
    let privacyResponse = await Data.updateSlatePrivacy({
      id: updates.id,
      isPublic: updates.isPublic,
    });

    if (!privacyResponse) {
      return res.status(404).send({ decorator: "UPDATE_COLLECTION_PRIVACY_FAILED", error: true });
    }

    if (privacyResponse.error) {
      return res.status(500).send({ decorator: "UPDATE_COLLECTION_PRIVACY_FAILED", error: true });
    }

    if (!updates.isPublic) {
      //NOTE(martina): if any of the files in it are now private (because they are no longer in any public slates) remove them from search
      const files = slate.objects;

      const publicFiles = await Data.getFilesByIds({
        ids: files.map((file) => file.id),
        publicOnly: true,
      });
      const publicIds = publicFiles.map((file) => file.id);

      let privateFiles = files.filter((file) => !publicIds.includes(file.id));

      if (privateFiles.length) {
        SearchManager.updateFile(privateFiles, "REMOVE");
      }
    } else {
      //NOTE(martina): make sure all the now-public files are in search if they weren't already
      const files = slate.objects;

      SearchManager.updateFile(files, "ADD");
    }
  }

  if (updates.data.name && updates.data.name !== slate.data.name) {
    if (!Validations.slatename(slate.data.name)) {
      return res.status(400).send({
        decorator: "INVALID_COLLECTION_NAME",
        error: true,
      });
    }

    const existingSlate = await Data.getSlateByName({
      slatename: updates.data.name,
      ownerId: user.id,
    });

    if (existingSlate) {
      return res.status(500).send({
        decorator: "COLLECTION_NAME_TAKEN",
        error: true,
      });
    } else {
      updates.slatename = Strings.createSlug(updates.data.name);
    }
  }

  let updatedSlate = await Data.updateSlateById(updates);

  if (!updatedSlate) {
    return res.status(404).send({ decorator: "UPDATE_COLLECTION_FAILED", error: true });
  }

  if (updatedSlate.error) {
    return res.status(500).send({ decorator: "UPDATE_COLLECTION_FAILED", error: true });
  }

  if (slate.isPublic && !updates.isPublic) {
    SearchManager.updateSlate(updatedSlate, "REMOVE");
  } else if (!slate.isPublic && updates.isPublic) {
    SearchManager.updateSlate(updatedSlate, "ADD");
  } else {
    SearchManager.updateSlate(updatedSlate, "EDIT");
  }

  ViewerManager.hydratePartial(user.id, { slates: true });

  return res.status(200).send({ decorator: "V2_UPDATE_COLLECTION", collection: updatedSlate });
};
