const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/scripts/index.ts",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Exploring code",
      template: "./src/index.html",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(glb|gltf|png)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/models/[name][ext]",
        },
      },
      {
        test: /\.png/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      // util: require.resolve("util/"),
      fs: false,
    },
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    // assetModuleFilename: "assets/[name][ext]",
  },
  optimization: {
    runtimeChunk: "single",
  },
};
