import { detectRingSignatureSnap, exportKeyImages, getAddresses, importAccount, installSnap, LSAG_signature, SAG_signature, verifySAG } from '@cypher-laboratory/alicesring-snap-sdk';
import React, { useState } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5em;
  margin-bottom: 0.5em;
`;

const Paragraph = styled.p`
  font-size: 1.2em;
  margin-bottom: 2em;
  text-align: center;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1em;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1em;
`;

const Button = styled.button`
  background-color: #6200ea;
  color: white;
  padding: 0.8em 1.5em;
  border: none;
  border-radius: 5px;
  margin: 0.5em;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1.2em; /* Increased font size */

  &:hover {
    background-color: #3700b3;
  }
`;

const Output = styled.div`
  margin-top: 1em;
  font-size: 1.1em;
`;

const Tick = styled.span`
  margin-left: 0.5em;
  color: green;
  font-size: 1.5em;
`;

const App: React.FC = () => {
  const [imported, setImported] = useState<boolean>(false);
  const [addressExported, setAddressExported] = useState<boolean>(false);
  const [keyImagesExported, setKeyImagesExported] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [keyImages, setKeyImages] = useState<string | null>(null);
  const [snapInstallStatus, setSnapInstallStatus] = useState<string>("");
  const [mainAddress, setMainAddress] = useState<string | null>(null);
  const [sag, setSag] = useState<string>("");
  const [lsag, setLsag] = useState<string>("");

  const handleInstall = async () => {
    // check if the snap is installed
    if (!(await detectRingSignatureSnap())) {
      setSnapInstallStatus("Installing snap...");
      // install the snap
      await installSnap();
    }

    if (await detectRingSignatureSnap())
      setSnapInstallStatus("Snap is installed");
  }

  const handleImportAccount = async () => {

    await importAccount();

    setImported(true);
  };

  const handleExportAddresses = async () => {

    const addresses = await getAddresses();

    if (addresses.length === 0) {
      alert("No addresses found");
      return;
    }

    setAddress(addresses.join(', '));
    setMainAddress(addresses[0]);
    setAddressExported(true); // Indicate successful export
  };

  const handleExportKeyImages = async () => {

    if (!mainAddress) {
      alert("No address found");
      return;
    }

    const keyImages = await exportKeyImages([mainAddress], "demo-snap-signature");
    if (!keyImages) {
      alert("No key images found for this address");
      return;
    }

    setKeyImages(keyImages.map((ki) => ki.keyImage).join(', '));
    setKeyImagesExported(true); // Indicate successful export
  };

  const ring = [
    '030066ba293cc22d0eadbe494e9bd4d6d05c3e09d74dff0e991075de74b2359678',
    '0316d7da70ba247a6a40bb310187e8789b80c45fa6dc0061abb8ced49cbe7f887f',
    '0221869ca3ae33be3a7327e9a0272203afa72c52a5460ceb9f4a50930531bd926a'
  ];
  const message = 'Hello Snap!';

  const linkabilityFlag = "demo-snap-signature";

  const handleSagSign = async () => {
    if (!mainAddress) {
      alert("Please export your addresses first");
      return;
    }

    const signature = await SAG_signature(ring, message, mainAddress);

    setSag(signature);
  };

  const handleLsagSign = async () => {
    if (!mainAddress) {
      alert("Please export your addresses first");
      return;
    }

    const signature = await LSAG_signature(ring, message, mainAddress, linkabilityFlag);

    setLsag(signature);
  };

  const handleVerifySag = async () => {
    if (!sag) {
      alert("Please sign using SAG first");
      return;
    }

    const result = await verifySAG(sag);

    alert(result ? "SAG signature is valid" : "SAG signature is invalid");
  };

  const handleVerifyLsag = async () => {
    if (!lsag) {
      alert("Please sign using LSAG first");
      return;
    }

    const result = await verifySAG(lsag);

    alert(result ? "LSAG signature is valid" : "LSAG signature is invalid");
  };


  return (
    <AppContainer>
      <Title>Ring Signature Snap - Demo</Title>
      <Paragraph>This is a simple demo of the endpoints of our Ring Signature snap. The full code for this app is available at https://github.com/Cypher-Laboratory/Demo-Snap</Paragraph>

      <ButtonColumn>
        <div>
          <Button onClick={handleInstall}>Install Snap</Button>
          {snapInstallStatus && <Output>{snapInstallStatus}</Output>}
        </div>
        <div>
          <Button onClick={handleImportAccount}>Import Account</Button>
          {imported && <Tick>&#10003;</Tick>}
        </div>
        <div>
          <Button onClick={handleExportAddresses}>Export Addresses</Button>
          {addressExported && <Tick>&#10003;</Tick>}
        </div>
        {address && <Output>Address: {address}</Output>}
        <div>
          <Button onClick={handleExportKeyImages}>Export Key Images</Button>
          {keyImagesExported && <Tick>&#10003;</Tick>}
        </div>
        {keyImages && <Output>Key Images: {keyImages}</Output>}
      </ButtonColumn>

      <ButtonRow>
        <Button onClick={handleSagSign}>Sign using SAG</Button>
        <Button onClick={handleLsagSign}>Sign using LSAG</Button>
      </ButtonRow>

      <ButtonRow>
        <Button onClick={handleVerifySag}>Verify SAG</Button>
        <Button onClick={handleVerifyLsag}>Verify LSAG</Button>
      </ButtonRow>

    </AppContainer>
  );
};

export default App;
