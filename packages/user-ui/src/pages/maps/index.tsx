import { ChangeEvent, useContext, useState } from "react"
import { AccountContext } from "../../context/account-context"
import { Button } from "../../atoms/button";

import './maps.css';
import axios from "axios";

export function Maps() {
  const account = useContext(AccountContext);
  const [ file, setFile ] = useState<File | null>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  async function getSignedUrl(filename: string) {
    const options = {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'x-api-key': 'j6s0TgKsEF6WbpSPj1wsS1Bh8mp7Sv7W2RETsiOR'
      }
    };
    return axios.get(`https://a7dxeoj4c8.execute-api.us-west-2.amazonaws.com/dev/map/save-image-url/${account.username}/${filename}`, options);
  }

  async function uploadFile() {
    const formData = new FormData();
    formData.append('image-file', file!);

    const signedUrlData = (await getSignedUrl(file!.name)).data;
    const result = await axios.put(signedUrlData.url, formData)
    console.log(result);
  }

  return <div className='app-main'>
    <label className='maps-label'>
      File
      <input type='file' name='imageFile' onChange={onChange}/>
    </label>
    <Button onClick={uploadFile} type='primary' disabled={!file}>Save</Button>
  </div>
}
