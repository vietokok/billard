import React, { Fragment, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Box, Button, TextField } from "@mui/material";
import _ from "lodash";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const players = ["Việt", "Quang", "Cường", "Hiếu"];

function getStyles(player, currentPlayers, theme) {
  return {
    fontWeight:
      currentPlayers.indexOf(player) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const getPlayerGroups = (currentPlayers = []) => {
  const result = [];
  const start = currentPlayers[0];
  for (let i = 1; i < currentPlayers.length; i++) {
    result.push(`${start}-${currentPlayers[i]}`);
  }
  return result;
};

export default function App() {
  const theme = useTheme();
  const [currentPlayers, setCurrentPlayers] = useState([
    "Việt",
    "Quang",
    "Cường",
    "Hiếu",
  ]);
  const [playType, setPlayType] = useState("2");
  const [playTypeDisabled, setPlayTypeDisabled] = useState(false);
  const [playerGroups, setPlayerGroups] = useState([]);
  const [currentPlayerGroupWin, setCurrentPlayerGroupWin] =
    useState("Việt-Hiếu");
  const [leaf, setLeaf] = useState(0);
  const [cueRents, setCueRents] = useState([]);
  const [tableMoney, setTableMoney] = useState(0);
  const [playerPaid, setPlayerPaid] = useState("Cường");
  const [isValid, setIsValid] = useState(true);

  const [result, setResult] = useState({});

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setCurrentPlayers(typeof value === "string" ? value.split(",") : value);
  };

  const handleCueChange = (event) => {
    const {
      target: { value },
    } = event;
    setCueRents(typeof value === "string" ? value.split(",") : value);
  };

  const calculate = () => {
    // check valid
    if (!currentPlayerGroupWin || !leaf || !tableMoney || !playerPaid) {
      setIsValid(false);
      setResult({});
      return;
    }
    const _leaf = !leaf ? 0 : parseInt(leaf);
    const _tableMoney = !tableMoney ? 0 : parseInt(tableMoney);
    const _result = {};
    if (playType === "2") {
      if (currentPlayers.length < 4 || currentPlayers.length % 2 === 1) {
        setIsValid(false);
        setResult({});
        return;
      }
      const tableMoneyPerPlayer =
        (_tableMoney - cueRents.length * 30000) / currentPlayers.length;
      const leafPerPlayer = (_leaf * 10000) / 2;
      const playerWins = _.split(currentPlayerGroupWin, "-");
      _.forEach(currentPlayers, (player) => {
        let total = -tableMoneyPerPlayer;
        let display = `-${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(tableMoneyPerPlayer)} (bàn)`;
        if (playerWins.includes(player)) {
          total += leafPerPlayer;
          display += ` + ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(leafPerPlayer)} (lá)`;
        } else {
          total -= leafPerPlayer;
          display += ` - ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(leafPerPlayer)} (lá)`;
        }
        if (cueRents.includes(player)) {
          total -= 30000;
          display += ` - ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(30000)} (gậy)`;
        }
        if (playerPaid === player) {
          total += _tableMoney;
          display += ` + ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(_tableMoney)} (tiền đã trả)`;
        }
        _.set(
          _result,
          player,
          display +
            ` = ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(total)}` +
            ` = ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(_.round(total / 10000, 1) * 10000)} (làm tròn)`
        );
      });
      setResult(_result);
      Object.keys(_result, (key) => {});
    }
  };

  useEffect(() => {
    if (
      currentPlayers.length === 0 ||
      currentPlayers.length < 4 ||
      currentPlayers.length % 2 === 1
    ) {
      setPlayType("1");
      setPlayTypeDisabled(true);
    } else {
      setPlayTypeDisabled(false);
    }
  }, [currentPlayers]);

  useEffect(() => {
    if (currentPlayers.length > 3 && currentPlayers.length % 2 === 0) {
      setPlayerGroups(getPlayerGroups(currentPlayers));
    } else {
      setPlayerGroups([]);
    }
  }, [currentPlayers]);

  const keys = Object.keys(result);

  return (
    <div style={{ padding: "4px" }}>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel>Người chơi</InputLabel>
        <Select
          multiple
          value={currentPlayers}
          onChange={handleChange}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          {players.map((player) => (
            <MenuItem
              key={player}
              value={player}
              style={getStyles(player, currentPlayers, theme)}
            >
              {player}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: "100%", mt: 2 }}>
        <InputLabel>Thuê gậy</InputLabel>
        <Select
          multiple
          value={cueRents}
          onChange={handleCueChange}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          {players.map((player) => (
            <MenuItem
              key={player}
              value={player}
              style={getStyles(player, cueRents, theme)}
            >
              {player}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: "100%", mt: 2 }}>
        <InputLabel>Kiểu chơi</InputLabel>
        <Select
          disabled={currentPlayers.length === 0 || playTypeDisabled}
          value={playType}
          onChange={(e) => setPlayType(e.target.value)}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          <MenuItem key="1" value="1">
            Đơn
          </MenuItem>
          <MenuItem key="2" value="2">
            Đôi
          </MenuItem>
        </Select>
      </FormControl>
      {playType === "2" && (
        <Fragment>
          <FormControl sx={{ width: "100%", mt: 2 }}>
            <InputLabel>Đội thắng</InputLabel>
            <Select
              value={currentPlayerGroupWin}
              onChange={(e) => setCurrentPlayerGroupWin(e.target.value)}
              input={<OutlinedInput />}
              MenuProps={MenuProps}
            >
              {playerGroups.map((playerGroup) => (
                <MenuItem key={playerGroup} value={playerGroup}>
                  {playerGroup}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            value={leaf}
            onChange={(e) => setLeaf(e.target.value)}
            type="number"
            sx={{ width: "100%", mt: 2 }}
            label="Số lá"
          />
          <TextField
            value={tableMoney}
            onChange={(e) => setTableMoney(e.target.value)}
            type="number"
            sx={{ width: "100%", mt: 2 }}
            label="Tiền bàn"
          />
          <FormControl sx={{ width: "100%", mt: 2 }}>
            <InputLabel>Người trả</InputLabel>
            <Select
              value={playerPaid}
              onChange={(e) => setPlayerPaid(e.target.value)}
              input={<OutlinedInput />}
              MenuProps={MenuProps}
            >
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={calculate} variant="contained">
              Tính
            </Button>
          </Box>
          {keys.length > 0 && (
            <Box sx={{ mt: 3 }}>
              {_.map(keys, (key) => (
                <Box sx={{ mb: 2 }}>
                  <b>{key}</b>: {result[key]}
                </Box>
              ))}
            </Box>
          )}
        </Fragment>
      )}
    </div>
  );
}
